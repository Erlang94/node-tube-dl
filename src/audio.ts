import fs from "node:fs"
import ytdl from "ytdl-core"
import ffmpeg from "fluent-ffmpeg"
import { YouTubeSearch } from "./search"

export class YouTubeAudio extends YouTubeSearch {
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
    
    public download(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const metadata = await this.getSpecificVideo()
                const audiopath = this.directory+metadata.title+this.extension
                const stream = ytdl(metadata.url, { filter: "audioonly", quality: 140 })
                
                ffmpeg(stream)
                    .audioCodec(this.codec)
                    .audioBitrate(this.bitrate)
                    .audioChannels(this.channels)
                    .save(audiopath)
                    .on("error", (error) => reject(error))
                
                resolve({
                    ...metadata,
                    audio: {
                        path: audiopath
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    }
}
