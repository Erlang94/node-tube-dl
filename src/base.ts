import yts from "yt-search"
import ytdl from "ytdl-core"

export class YouTube {
    protected url: string

    constructor(url: string) {
        this.url = url
    }

    public getAllVideo(): Promise<Awaited<ReturnType<typeof yts>>> {
        try {
            return yts({ query: this.url })
        } catch (e) {
            throw e
        }
    }

    public async getSpecificVideo(): Promise<Awaited<ReturnType<typeof yts>>> {
        try {
            if (ytdl.validateURL(this.url)) {
                return yts({ videoId: ytdl.getVideoID(this.url) })
            } else {
                const data = await yts({ query: this.url })
                return data.videos[0]
            }
        } catch (e) {
            throw e
        }
    }
}