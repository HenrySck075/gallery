import {writeFileSync, mkdirSync} from "fs"
import sharp from "sharp"

const j = await (await fetch("https://fd.api.iris.microsoft.com/v4/api/selection?&placement=88000820&bcnt=4&country=JP&locale=ja-JP&fmt=json")).json()
//console.dir(j)
const spotlightImages = (j).batchrsp.items;

mkdirSync("./spotlight/landscape", {recursive: true})
mkdirSync("./spotlight/portrait")

const files: [string[], string[]] = [
  [], // landscape
  [] // portrait
]

for (const spotlightImageData of spotlightImages) {
  const payload: {
    ad: {
      landscapeImage: {
        asset: string // url to image
      },
      portraitImage: {
        asset: string // the exact same object
      }
    }
  } = JSON.parse(spotlightImageData.item)
  // download both images in its respective folders under a new filename of {i}.{fileext}
  const landscapeImageUrl = payload.ad.landscapeImage.asset
  const portraitImageUrl = payload.ad.portraitImage.asset

  const landscapeImageFilename = landscapeImageUrl.split("/").pop()!
  const portraitImageFilename = portraitImageUrl.split("/").pop()!

  const landscapeImageData = await (await fetch(landscapeImageUrl)).arrayBuffer()
  const portraitImageData = await (await fetch(portraitImageUrl)).arrayBuffer()

  sharp(landscapeImageData).resize(1366,768,{fit: "inside"}).toFile(`./spotlight/landscape/${landscapeImageFilename}`)

  sharp(portraitImageData).resize(768,1366,{fit:"outside"}).toFile(`./spotlight/portrait/${portraitImageData}`)

  files[0].push(landscapeImageFilename)
  files[1].push(portraitImageFilename)
}

writeFileSync("./spotlight/items", spotlightImages.length.toString()+"\n"+files.flat().join("\n"))
