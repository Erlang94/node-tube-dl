import fs from "node:fs"
import ytdl from "ytdl-core"
import ffmpeg from "fluent-ffmpeg"
import { YouTubeSearch } from "./search"

export class YouTubeAudio extends YouTubeSearch {
    private audioCodec: string
    private audioChannels: number
    private audioBitrate: string
    private fname: string
    private ext: string
    private dir: string

    constructor(url: string) {
        super(url)
    }

    public codec(audioCodec: string): YouTubeAudio {
        this.audioCodec = audioCodec
        return this
    }

    public bitrate(audioBitrate: string): YouTubeAudio {
        this.audioBitrate = audioBitrate
        return this
    }

    public channels(audioChannels: number): YouTubeAudio {
        this.audioChannels = audioChannels
        return this
    }

    public outdir(dir: string): YouTubeAudio {
        dir = dir.endsWith("/") ? dir : dir + "/"
        if (!fs.existsSync(dir)) fs.mkdirSync(dir)
        this.dir = dir
        return this
    }

    public extension(ext: string): YouTubeAudio {
        this.ext = ext
        return this
    }

    public filename(fname: string): YouTubeAudio {
        this.fname = fname
        return this
    }

    public download(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const metadata = await this.getSpecificVideo()
                const stream = ytdl(metadata.url, { quality: 140 })
                const audioPath = this.dir + (this.fname || metadata.title) + this.ext

                ffmpeg(stream)
                    .audioCodec(this.audioCodec)
                    .audioBitrate(this.audioBitrate)
                    .audioChannels(this.audioChannels)
                    .save(audioPath)
                    .on("error", (e) => reject(e))
                    .on("end", () => {
                        resolve({
                            ...metadata,
                            audioPath,
                        })
                    })
            } catch (e) {
                reject(e)
            }
        })
    }
}
