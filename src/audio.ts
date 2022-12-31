import fs from "node:fs"
import ytdl from "ytdl-core"
import ffmpeg from "fluent-ffmpeg"
import { YouTube } from "./base"

export class YouTubeAudio extends YouTube {
    private codec: string
    private bitrate: string
    private channels: number
    private extension: string
    private directory: string
    
    constructor(url: string) {
        super(url)
    }
    
    public setCodec(codec: string): YouTubeAudio {
        this.codec = codec
        return this
    }
    
    public setBitrate(bitrate: string): YouTubeAudio {
        this.bitrate = bitrate
        return this
    }
    
    public setChannels(channels: number): YouTubeAudio {
        this.channels = channels
        return this
    }
    
    public setOutDir(directory: string): YouTubeAudio {
        directory = directory.endsWith("/") ? directory : directory+"/"
        if (!fs.existsSync(directory)) fs.mkdirSync(directory)
        this.directory = directory
        return this
    }
    
    public setExtension(extension: string): YouTubeAudio {
        this.extension = extension
        return this
    }
    
    public async download(): Promise<Awaited<ReturnType<typeof this.getSpecificVideo>> & { audio: { path: string } }> {
        try {
            const metadata = await this.getSpecificVideo()
            const stream = ytdl(metadata.url, { filter: "audioonly", quality: 140 })
            const path = this.directory+metadata.title+this.extension
            const audio = await new Promise((resolve) => {
                ffmpeg(stream)
                    .audioCodec(this.codec)
                    .audioBitrate(this.bitrate)
                    .audioChannels(this.channels)
                    .save(path)
                    .on("end", () => resolve(path))
            })
            return {
                ...metadata,
                audio: {
                    path: audio
                }
            }
        } catch (e) {
            throw e
        }
    }
}