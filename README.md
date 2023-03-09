## youtube downloader

### Note
To use this library you must have [FFmpeg](https://ffmpeg.org) installed on your computer

### Installing package
```bash
npm install node-tube-dl
```
### Example download audio

```js
// import { YouTubeAudio } from "node-tube-dl" // Typescript
const { YouTubeAudio } = require("node-tube-dl")

const url = "https://youtube.com/watch?v=_QW9gBdDU1c"
const myfolder = "./bin/"

new YouTubeAudio(url)
    .codec("aac") // Get available audio codec from FFmpeg docs
    .bitrate("128k")
    .channels(2)
    .outdir(myfolder)
    // .filename("my_music") // set filename (optional). by default the file name uses the title of the video
    .extension(".m4a")
    .download()
    .then(result => console.log(result))
    .catch(e => console.log(e))
```

### Example download audio v2

```js
// import { YouTubeAudioV2 } from "node-tube-dl" // Typescript
const { YouTubeAudioV2 } = require("node-tube-dl")
const fs = require("fs/promises")

const url = "https://youtube.com/watch?v=_QW9gBdDU1c"

// Example outputBuffer
// Audio output encoded to Ogg Vorbis (libvorbis), Audio file extension: .ogg
new YouTubeAudioV2(url)
    .outputBuffer()
    .download()
    .then(async (result) => {
        await fs.mkdir("./bin/")
        await fs.writeFile("./bin/audio.ogg", result.audioBuffer)
        
        console.log(result)
    })
    .catch((e) => console.log(e))

// Example outputFile
// Audio output encoded to Ogg Vorbis (libvorbis), Audio file extension: .ogg
new YouTubeAudioV2(url)
    .outputFile("./bin") // path to your folder
    // .filename("my_music") // set filename (optional). by default the file name uses the title of the video
    .download()
    .then((result) => {
        console.log(result)
    })
    .catch((e) => console.log(e))
```

### Example download video

```js
// import { YouTubeVideo } from "node-tube-dl" // Typescript
const { YouTubeVideo } = require("node-tube-dl")

const url = "https://youtube.com/watch?v=_QW9gBdDU1c"
const myfolder = "./bin/"

new YouTubeVideo(url)
    .quality("720p") // Available quality: 144p, 240p, 360p, 480p, 720p, 1080p
    .outdir(myfolder)
    // .filename("my_video") // set filename (optional). by default the file name uses the title of the video
    .download()
    .then(result => console.log(result))
    .catch(e => console.log(e))
```

### Search videos

```js
// import { YouTubeSearch } from "node-tube-dl" // Typescript
const { YouTubeSearch } = require("node-tube-dl")

const query = "Axel Johansson"

// get all videos
new YouTubeSearch(query)
    .getAllVideo()
    .then(result => console.log(result.videos))
    .catch(e => console.log(e))
    
// get specific video
new YouTubeSearch(query)
    .getSpecificVideo()
    .then(result => console.log(result))
    .catch(e => console.log(e))
```