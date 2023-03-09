import yts from "yt-search"
import ytdl from "ytdl-core"

export class YouTubeSearch {
    protected url: string

    constructor(url: string) {
        this.url = url
    }

    public getAllVideo(): Promise<any> {
        return new Promise((resolve, reject) => {
            yts({ query: this.url })
                .then((result) => resolve(result))
                .catch((error) => reject(error))
        })
    }

    public getSpecificVideo(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (ytdl.validateURL(this.url)) {
                yts({ videoId: ytdl.getVideoID(this.url) })
                    .then((result) => resolve(result))
                    .catch((error) => reject(error))
            } else {
                yts({ query: this.url })
                    .then(({ videos }) => resolve(videos[0]))
                    .catch((error) => reject(error))
            }
        })
    }
}
