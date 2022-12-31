import fs from "node:fs"
import { join } from "node:path"
import crypto from "node:crypto"
import ytdl from "ytdl-core"
import ffmpeg from "fluent-ffmpeg"
import { YouTube } from "./base"

export class YouTubeVideo extends YouTube {
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
        directory = directory.endsWith("/") ? directory : directory+"/"
        if (!fs.existsSync(directory)) fs.mkdirSync(directory)
        this.directory = directory
        return this
    }
    
    private addAudio(audio: string, video: string, title: string): Promise<string> {
        const path = this.directory+title+".mp4"
        return new Promise((resolve, reject) => {
            ffmpeg(video)
                .addInput(audio)
                .outputOptions([
                    "-map", "0",
                    "-map", "1:a",
                    "-c:v", "copy",
                    "-shortest"
                ])
                .save(path)
                .on("error", (e) => reject(e))
                .on("end", () => {
                    fs.unlinkSync(audio)
                    fs.unlinkSync(video)
                    resolve(path)
                })
            })
    }
    
    public async download(): Promise<Awaited<ReturnType<typeof this.getSpecificVideo>> & { video: { path: string } }> {
        try {
            const metadata = await this.getSpecificVideo()
            if (!fs.existsSync(join(__dirname, "../temp"))) fs.mkdirSync(join(__dirname, "../temp"))
            const tempVideoPath = join(__dirname, "../temp/"+crypto.randomBytes(9).toString("hex")+".mp4")
            const tempAudioPath = join(__dirname, "../temp/"+crypto.randomBytes(9).toString("hex")+".m4a")
            const videoStream = ytdl(metadata.url, { filter: "videoonly", quality: this.quality })
            const video = await new Promise((resolve, reject) => {
                ffmpeg(videoStream)
                    .save(tempVideoPath)
                    .on("error", (e) => reject(e))
                    .on("end", () => resolve(tempVideoPath))
            })
            const audioStream = ytdl(metadata.url, { filter: "audioonly", quality: 140 })
            const audio = await new Promise((resolve, reject) => {
                ffmpeg(audioStream)
                    .audioCodec("aac")
                    .audioBitrate(128)
                    .audioChannels(2)
                    .save(tempAudioPath)
                    .on("error", (e) => reject(e))
                    .on("end", () => resolve(tempAudioPath))
            })
            const result = await this.addAudio(audio as string, video as string, metadata.title)
            return {
                video: {
                    path: result,
                },
                ...metadata,
            }
        } catch (e) {
            throw e
        }
    }
    
    private parseQuality(quality: string): string {
        try {
            let result: string
            switch(quality) {
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
                default: {
                    throw Error("Quality not found!")
                }
            }
            return result
        } catch (e) {
            throw e
        }
    }
}