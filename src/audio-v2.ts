import fs from "node:fs"
import { join } from "node:path"
import ytdl from "ytdl-core"
import ffmpeg from "fluent-ffmpeg"
import { YouTubeSearch } from "./search"

export class YouTubeAudioV2 extends YouTubeSearch {
    private file: string | null
    private useBuffer: boolean
    private fname: string

    constructor(url: string) {
        super(url)
        this.file = null
        this.useBuffer = false
    }

    public outputFile(path: string): YouTubeAudioV2 {
        this.file = path
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
                const stream = ytdl(metadata.url, { quality: 140 })

                if (this.file) {
                    const audio = this.file + (this.fname || metadata.title) + ".ogg"
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
                    const tempAudio = join(__dirname, "../temp/" + metadata.title + ".ogg")
                    ffmpeg(stream)
                        .audioCodec("libvorbis")
                        .audioBitrate("128k")
                        .save(tempAudio)
                        .on("error", (e) => reject(e))
                        .on("end", async () => {
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
