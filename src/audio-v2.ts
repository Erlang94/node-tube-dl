import fs from "node:fs"
import { join } from "node:path"
import { randomBytes } from "node:crypto"
import ytdl from "ytdl-core"
import ffmpeg from "fluent-ffmpeg"
import { YouTubeSearch } from "./search"

export class YouTubeAudioV2 extends YouTubeSearch {
    private dir: string | null
    private useBuffer: boolean
    private fname: string

    constructor(url: string) {
        super(url)
        this.dir = null
        this.useBuffer = false
    }

    public outputFile(dir: string): YouTubeAudioV2 {
        dir = dir.endsWith("/") ? dir : dir + "/"
        if (!fs.existsSync(dir)) fs.mkdirSync(dir)
        this.dir = dir
        return this
    }

    public outputBuffer(): YouTubeAudioV2 {
        this.useBuffer = true
        return this
    }

    public filename(fname: string): YouTubeAudioV2 {
        this.fname = fname
        return this
    }

    public download(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const metadata = await this.getSpecificVideo()
                const stream = ytdl(metadata.url, { filter: "audioonly", quality: 140 })

                if (this.dir) {
                    const audio = this.dir + (this.fname || metadata.title) + ".ogg"
                    ffmpeg(stream)
                        .audioCodec("libvorbis")
                        .audioBitrate("128k")
                        .save(audio)
                        .on("error", (error) => reject(error))
                        .on("end", () => {
                            resolve({
                                ...metadata,
                                audioPath: audio,
                            })
                        })
                } else {
                    if (!fs.existsSync(join(__dirname, "../temp"))) {
                        fs.mkdirSync(join(__dirname, "../temp"))
                    }
                    const tempAudio = join(__dirname, "../temp/" + randomBytes(50).toString("hex") + ".ogg")
                    ffmpeg(stream)
                        .audioCodec("libvorbis")
                        .audioBitrate("128k")
                        .save(tempAudio)
                        .on("error", (e) => reject(e))
                        .on("end", () => {
                            const stream = fs.createReadStream(tempAudio)
                            const data = []
                            stream.on("data", (chunk) => {
                                data.push(chunk)
                            })
                            stream.on("end", async () => {
                                await fs.promises.unlink(tempAudio).then(() => {
                                    resolve({
                                        ...metadata,
                                        audioBuffer: Buffer.concat(data),
                                    })
                                })
                            })
                            stream.on("error", (e) => reject(e))
                        })
                }
            } catch (e) {
                reject(e)
            }
        })
    }
}
