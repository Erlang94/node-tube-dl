const { YouTubeVideo, YouTubeAudio, YouTube } = require("../lib")
const { join } = require("path")

function test1(url) {
    new YouTubeVideo(url)
        .setQuality("2160p") // Avalable quality: 144p, 240p, 360p, 480p, 720p, 1080p, 1440p, 2160p
        .setOutDir("test/bin/")
        .download()
        .then(data => console.log(data))
        .catch(e => console.log(e))
}

function test2(url) {
    new YouTubeAudio(url)
        .setCodec("aac")
        .setBitrate("128k")
        .setChannels(2)
        .setOutDir("test/bin/")
        .setExtension(".m4a")
        .download()
        .then(data => console.log(data))
        .catch(e => console.log(e))
}

function test3(query, p) {
    switch (p) {
        case "all": {
            new YouTube(query)
                .getAllVideo()
                .then(data => console.log(data.videos))
                .catch(e => console.log(e))
                break
        }
        case "specific": {
            new YouTube(query)
                .getSpecificVideo()
                .then(data => console.log(data))
                .catch(e => console.log(e))
                break
        }
    }
}

const url = "https://youtube.com/watch?v=_QW9gBdDU1c"
const query = "Axel Johansson"

test1(url)
// test2(url)
// test3(query, "all")