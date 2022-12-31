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
    .setCodec("aac") // get available codec -> ffmpeg.org
    .setBitrate("128k")
    .setChannels(2)
    .setOutDir(myfolder)
    .setExtension(".m4a")
    .download()
    .then(result => console.log(result))
    .catch(e => console.log(e))
```

### Example download video

```js
// import { YouTubeVideo } from "node-tube-dl" // Typescript
const { YouTubeVideo } = require("node-tube-dl")

const url = "https://youtube.com/watch?v=_QW9gBdDU1c"
const myfolder = "./bin/"

new YouTubeVideo(url)
    .setQuality("1080p") // Avalable quality: 144p, 240p, 360p, 480p, 720p, 1080p, 1440p, 2160p
    .setOutDir(myfolder)
    .download()
    .then(result => console.log(result))
    .catch(e => console.log(e))
```

### Search videos

```js
// import { YouTube } from "node-tube-dl" // Typescript
const { YouTube } = require("node-tube-dl")

const query = "Axel Johansson"

// get all videos
new YouTube(query)
    .getAllVideo()
    .then(result => console.log(result.videos))
    .catch(e => console.log(e))
    
// get specific video
new YouTube(query)
    .getSpecificVideo()
    .then(result => console.log(result))
    .catch(e => console.log(e))
```