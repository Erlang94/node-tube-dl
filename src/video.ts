import fs from "node:fs"
import { join } from "node:path"
import { Readable } from "node:stream"
import crypto from "node:crypto"
import ytdl from "ytdl-core"
import ffmpeg from "fluent-ffmpeg"
import { YouTubeSearch } from "./search"

export class YouTubeVideo extends YouTubeSearch {
    private quality: string
    private directory: string

    constructor(url: string) {
        super(url)
    }

    public setQuality(quality: string): YouTubeVideo {
        this.quality = this.parseQuality(quality)
        return this
    }

    public setOutDir(directory: string): YouTubeVideo {
        directory = directory.endsWith("/") ? directory : directory + "/"
        if (!fs.existsSync(directory)) fs.mkdirSync(directory)
        this.directory = directory
        return this
    }

    private addAudio(audiopath: string, video: Readable, title: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const output = this.directory + title + ".mp4"
            ffmpeg(video)
                .addInput(audiopath)
                .outputOptions(["-map", "0", "-map", "1:a", "-c:v", "copy", "-shortest"])
                .save(output)
                .on("error", (error) => reject(error))
                .on("end", () => {
                    fs.unlinkSync(audiopath)
                    resolve(output)
                })
        })
    }

    private createTempDir() {
        if (!fs.existsSync(join(__dirname, "../temp"))) {
            fs.mkdirSync(join(__dirname, "../temp"))
        }
    }

    private streamToFile(input: Readable, output: string): Promise<string> {
        return new Promise((resolve, reject) => {
            ffmpeg(input)
                .save(output)
                .on("error", (error) => reject(error))
                .on("end", () => resolve(output))
        })
    }

    public async download(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const metadata = await this.getSpecificVideo()
                this.createTempDir()
                const tempAudioPath = join(__dirname, "../temp/" + crypto.randomBytes(9).toString("hex") + ".m4a")
                const videoStream = ytdl(metadata.url, { filter: "videoonly", quality: this.quality })
                const audioStream = ytdl(metadata.url, { filter: "audioonly", quality: 140 })
                await this.streamToFile(audioStream, tempAudioPath)
                const result = await this.addAudio(tempAudioPath, videoStream, metadata.title)
                resolve({
                    ...metadata,
                    video: {
                        path: result,
                    },
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    private parseQuality(quality: string): string {
        let result: string
        switch (quality) {
            case "144p": {
                result = "160"
                break
            }
            case "240p": {
                result = "133"
                break
            }
            case "360p": {
                result = "134"
                break
            }
            case "480p": {
                result = "135"
                break
            }
            case "720p": {
                result = "136"
                break
            }
            case "1080p": {
                result = "137"
                break
            }
            case "1440p": {
                result = "400"
                break
            }
            case "2160p": {
                result = "401"
                break
            }
            default:
                throw Error("Quality not found!")
        }
        return result
    }
}
