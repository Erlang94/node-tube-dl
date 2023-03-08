import fs from "node:fs"
import { join } from "node:path"
import ytdl from "ytdl-core"
import ffmpeg from "fluent-ffmpeg"
import { YouTubeSearch } from "./search"

export class YouTubeAudioV2 extends YouTubeSearch {
    private file: { path: string; chosen: boolean }
    private buffer: { buffer?: Buffer; chosen: boolean }

    constructor(url: string) {
        super(url)
    }

    public toFile(path: string): YouTubeAudioV2 {
        path = path.endsWith("/") ? path : path + "/"
        this.file = { path, chosen: true }
        return this
    }

    public toBuffer(): YouTubeAudioV2 {
        this.buffer = { chosen: true }
        return this
    }

    private createTempDir() {
        if (!fs.existsSync(join(__dirname, "../temp"))) {
            fs.mkdirSync(join(__dirname, "../temp"))
        }
    }

    public download(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.file && this.file.chosen && this.buffer && this.buffer.chosen) {
                    throw Error("Choose one: toFile or toBuffer!")
                }
                const metadata = await this.getSpecificVideo()
                const stream = ytdl(metadata.url, { filter: "audioonly", quality: 140 })

                if (this.file && this.file.chosen) {
                    const audiopath = this.file.path + metadata.title + ".ogg"
                    ffmpeg(stream)
                        .audioCodec("libvorbis")
                        .save(audiopath)
                        .on("error", (error) => reject(error))
                        .on("end", () => {
                            resolve({
                                ...metadata,
                                audioPath: audiopath,
                            })
                        })
                }
                if (this.buffer && this.buffer.chosen) {
                    this.createTempDir()
                    const audiopath = join(__dirname, "../temp/" + metadata.title + ".ogg")
                    ffmpeg(stream)
                        .audioCodec("libvorbis")
                        .save(audiopath)
                        .on("error", (error) => reject(error))
                        .on("end", async () => {
                            await fs.promises.readFile(audiopath).then(async (buffer) => {
                                this.buffer.buffer = buffer
                                resolve({
                                    ...metadata,
                                    audioBuffer: buffer,
                                })
                                await fs.promises.unlink(audiopath)
                            })
                        })
                }
            } catch (e) {
                reject(e)
            }
        })
    }
}
