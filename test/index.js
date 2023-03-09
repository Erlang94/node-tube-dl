const { YouTubeVideo, YouTubeAudio, YouTubeSearch, YouTubeAudioV2 } = require("../lib")
const fs = require("fs/promises")

function test1(url, filename) {
    if (filename) {
        new YouTubeVideo(url)
            .quality("720p")
            .outdir("test/bin/")
            .filename(filename)
            .download()
            .then((data) => console.log(data))
            .catch((e) => console.log(e))
    } else {
        new YouTubeVideo(url)
            .quality("720p")
            .outdir("test/bin/")
            .download()
            .then((data) => console.log(data))
            .catch((e) => console.log(e))
    }
}

function test2(url, outType, filename) {
    switch (outType) {
        case "buffer": {
            new YouTubeAudioV2(url)
                .outputBuffer()
                .download()
                .then(async (data) => {
                    await fs.writeFile("test/bin/audio.ogg", data.audioBuffer).then(() => {
                        console.log(data)
                    })
                })
                .catch((e) => console.log(e))
            break
        }
        case "file": {
            new YouTubeAudioV2(url)
                .outputFile("test/bin")
                .filename(filename)
                .download()
                .then((data) => {
                    console.log(data)
                })
                .catch((e) => console.log(e))
            break
        }
        case "file2": {
            new YouTubeAudioV2(url)
                .outputFile("test/bin")
                .download()
                .then((data) => {
                    console.log(data)
                })
                .catch((e) => console.log(e))
            break
        }
    }
}

function test3(url, filename) {
    if (filename) {
        new YouTubeAudio(url)
            .codec("aac")
            .bitrate("128k")
            .channels(2)
            .filename(filename)
            .outdir("test/bin/")
            .extension(".m4a")
            .download()
            .then((data) => {
                console.log(data)
            })
            .catch((e) => console.log(e))
    } else {
        new YouTubeAudio(url)
            .codec("aac")
            .bitrate("128k")
            .channels(2)
            .outdir("test/bin/")
            .extension(".m4a")
            .download()
            .then((data) => {
                console.log(data)
            })
            .catch((e) => console.log(e))
    }
}

function test4(query, p) {
    switch (p) {
        case "all": {
            new YouTubeSearch(query)
                .getAllVideo()
                .then((data) => console.log(data.videos))
                .catch((e) => console.log(e))
            break
        }
        case "specific": {
            new YouTubeSearch(query)
                .getSpecificVideo()
                .then((data) => console.log(data))
                .catch((e) => console.log(e))
            break
        }
    }
}

const url = "https://youtube.com/watch?v=_QW9gBdDU1c"
const query = "Axel Johansson"

// test1(url)
test2(url, "file2")
// test3(url, "my_music")
// test4(query, "all")

process.on("SIGINT", () => {
    process.exit(0)
})
