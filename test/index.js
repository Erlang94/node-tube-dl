const { YouTubeVideo, YouTubeAudio, YouTubeSearch, YouTube, YouTubeAudioV2 } = require("../lib")
const fs = require("fs/promises")

function test1(url) {
    new YouTubeVideo(url)
        .setQuality("480p") // Available quality: 144p, 240p, 360p, 480p, 720p, 1080p
        .setOutDir("test/bin/")
        .download()
        .then((data) => console.log(data))
        .catch((e) => console.log(e))
}

function test2(url) {
    new YouTubeAudio(url)
        .setCodec("aac")
        .setBitrate("128k")
        .setChannels(2)
        .setOutDir("test/bin/")
        .setExtension(".m4a")
        .download()
        .then((data) => console.log(data))
        .catch((e) => console.log(e))
}

function test3(query, p) {
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

function test4(url, t) {
    switch (t) {
        case 1: {
            new YouTubeAudioV2(url)
                .setToBuffer()
                .download()
                .then(async (data) => {
                    await fs.writeFile("test/bin/audio.ogg", data.audioBuffer)
                    console.log(data)
                })
                .catch((e) => console.log(e))
            break
        }
        case 2: {
            new YouTubeAudioV2(url)
                .setToFile("test/bin/")
                .download()
                .then((data) => {
                    console.log(data)
                })
                .catch((e) => console.log(e))
            break
        }
    }
}

const url = "https://youtube.com/watch?v=_QW9gBdDU1c"
const query = "Axel Johansson"

// test1(url)
// test2(url)
// test3(query, "specific")
test4(url, 1)
