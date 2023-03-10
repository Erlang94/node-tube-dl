import fs from "node:fs"
import { join } from "node:path"
import { randomBytes } from "node:crypto"
import ytdl from "ytdl-core"
import ffmpeg from "fluent-ffmpeg"
import { YouTubeSearch } from "./search"

export class YouTubeVideo extends YouTubeSearch {
    private ql: string
    private dir: string
    private fname: string

    constructor(url: string) {
        super(url)
    }

    public quality(ql: string): YouTubeVideo {
        this.ql = ql
        return this
    }

    public outdir(dir: string): YouTubeVideo {
        dir = dir.endsWith("/") ? dir : dir + "/"
        if (!fs.existsSync(dir)) fs.mkdirSync(dir)
        this.dir = dir
        return this
    }

    public filename(fname: string): YouTubeVideo {
        this.fname = fname
        return this
    }

    public download(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const metadata = await this.getSpecificVideo()
                const audioStream = ytdl(metadata.url, { filter: "audioonly", quality: 140 })
                const videoStream = ytdl(metadata.url, { filter: "videoonly", quality: await this.parseQl(this.ql) })

                if (!fs.existsSync(join(__dirname, "../temp"))) {
                    await fs.promises.mkdir(join(__dirname, "../temp"))
                }
                const tempAudio = join(__dirname, "../temp/" + randomBytes(50).toString("hex") + ".m4a")

                const videoPath = this.dir + (this.fname || metadata.title) + ".mp4"

                ffmpeg(audioStream)
                    .save(tempAudio)
                    .on("error", (e) => reject(e))
                    .on("end", () => {
                        ffmpeg(videoStream)
                            .addInput(tempAudio)
                            .outputOptions(["-map", "0", "-map", "1:a", "-c:v", "copy", "-shortest"])
                            .save(videoPath)
                            .on("error", (e) => reject(e))
                            .on("end", async () => {
                                await fs.promises.unlink(tempAudio).then(() => {
                                    resolve({
                                        ...metadata,
                                        videoPath,
                                    })
                                })
                            })
                    })
            } catch (e) {
                reject(e)
            }
        })
    }

    private parseQl(ql: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let result: string

            switch (ql) {
                case "144p":
                    result = "160"
                    break

                case "240p":
                    result = "133"
                    break

                case "360p":
                    result = "134"
                    break
                case "480p":
                    result = "135"
                    break

                case "720p":
                    result = "136"
                    break

                case "1080p":
                    result = "137"
                    break
                default:
                    reject(Error("Quality not found"))
            }
            resolve(result)
        })
    }
}
