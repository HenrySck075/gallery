import fs from 'fs'

const metadataFile = process.argv[2]
const saveFolder = process.argv[3]
// check both's existence before continuing
if (!fs.existsSync(metadataFile)) {
  console.error(`Metadata file ${metadataFile} does not exist.`)
  process.exit(1)
}
if (!fs.existsSync(saveFolder)) {
  console.error(`Save folder ${saveFolder} does not exist.`)
  process.exit(1)
}

function sleep(delay: number) {
  return new Promise((r)=>setTimeout(r, delay))
}

import l from "log4js"

l.configure({
  "appenders": {
    "mein": {
      "type": "console",
    },
    chromium: {
      type: "file",
      filename: "chromium.log"
    }
  },
  "categories": {
    "default": {
      appenders: ["mein"],
      level: "DEBUG"
    },
    "cdp": {
      appenders: ["chromium", "mein"],
      level: "DEBUG"
    }
  }
})

const logger = l.getLogger()
logger.level = process.argv[4] ?? "INFO"

const CHROMIUM_PATH = process.env.CHROMIUM_PATH

if (CHROMIUM_PATH === undefined && process.env.ANDROID_ROOT==="/system") {
  console.error("You idiot how do i know where did you install chromium???? (termux users beware)")
  process.exit(1)
}

import puppeteer from "puppeteer-extra"
import type { Browser, ScreenRecorder } from "puppeteer-core"
import puppetstealth from "puppeteer-extra-plugin-stealth"

puppeteer.use(puppetstealth())

logger.info("Starting browser...")
const browser: Browser = await puppeteer.launch({
  headless: true,
  executablePath: CHROMIUM_PATH,
  args: ['--no-sandbox', '--force-prefers-reduced-motion', ...(process.env.ANDROID_ROOT==="/system" ? ['--disable-gpu'] : []), ...(process.env.WEBGL_WORKAROUND ? ['--use-gl=egl', '--disable-webgl-image-chromium', '--disable-gpu-compositing', '--disable-dev-shm-usage'] : [])]
})

import UserAgents from "user-agents"

const page = await browser.newPage()
page.setUserAgent({userAgent: (new UserAgents()).toString()})

const devtools = await page.createCDPSession()

const cdpLogger = l.getLogger("cdp")

// Capture all logs from the page and output it through the cdp logger
page.on('console', (msg) => {
  cdpLogger.log(getLogLevelFromConsoleLogType(msg.type()), msg.text());
});
logger.debug("navigating to page")

/// yes
/// returns the same for debug, warn, error; debug for trace, error for assert and info for everythibg else 
function getLogLevelFromConsoleLogType(t: string) {
  switch (t) {
    case "debug":
    case "warning":
    case "error":
      return t
    case "trace":
    case "assert":
      return "debug"
    default:
      return "info"
  }
}

let rec: ScreenRecorder | null = null

try {
logger.debug("extracting maplibre map object")

const mapobj_name = "__maplibre_map"
let maplibre_map_extracted = false

const bpIds: string[] = []

await devtools.send("Debugger.enable")
devtools.on("Debugger.scriptParsed", (p)=>{
  if (!p.url.startsWith("https://wplace.live/_app/immutable/nodes/")) return;
  if (p.url.startsWith("https://wplace.live/_app/immutable/nodes/app")) return;
  logger.debug(p.url)

  // Find the position after "{get map(){return " (before the return) in the src
  devtools.send("Debugger.getScriptSource", {scriptId: p.scriptId}).then(async (src)=>{
    const index = src.scriptSource.indexOf("{get map(){return ")
    if (index === -1) return;

    const pos = index + "{get map(){".length
    const rvPos = index + "{get map(){return ".length

    // after rvPos is the returning value, 

    // store the text after rvPos and before the immediate next } (theres only one of them before the function ends)
    const endPos = src.scriptSource.indexOf("}", rvPos)
    const returnValue = src.scriptSource.slice(rvPos, endPos).trim()

    const copier = `window.${mapobj_name} = ${returnValue}`

    const lineNumber = src.scriptSource.slice(0, pos).split("\n").length - 1
    const columnNumber = pos - src.scriptSource.lastIndexOf("\n", pos) - 1

    // place down a breakpoint at pos to run copier
    const {breakpointId} = await devtools.send("Debugger.setBreakpoint", {
      location: {
        scriptId: p.scriptId,
        lineNumber,
        columnNumber 
      }
    })

    logger.debug(`Placed breakpoint ${p.url}:${lineNumber}:${columnNumber}`)

    bpIds.push(breakpointId);

    // TODO: ts heavy af
    devtools.on("Debugger.paused", async (pauseEvent)=>{
      for (const callFrame of pauseEvent.callFrames) {
        if (callFrame.location.scriptId === p.scriptId) {
          // evaluate copier in this call frame
          await devtools.send("Debugger.evaluateOnCallFrame", {
            callFrameId: callFrame.callFrameId,
            expression: copier
          })
          
          // verify __maplibre_map's existence in global
          logger.debug("Verifying extraction")
          const evalResult = await devtools.send("Runtime.evaluate", {
            expression: `window.${mapobj_name} !== undefined`
          })
          if (!evalResult.result.value) {
            logger.error("Failed to extract maplibre map object!")
            return
          }

          logger.debug("Captured, removing all breakpoints")
          // remove all breakpoints
          for (const id of bpIds) {
            await devtools.send("Debugger.removeBreakpoint", {breakpointId: id})
          }
          // resume execution
          await devtools.send("Debugger.resume")
          maplibre_map_extracted = true
          return
        }
      }
    })
  })
})

await page.goto("https://wplace.live")
await page.setViewport({width: 1920, height: 1080})
if (process.env.ENABLE_RECORDING)
  rec = await page.screencast({path: "debug/r.mp4", format: "mp4"})
try{
  const h = await page.locator("div#map ~ div > div button[title=Explore]").waitHandle()
  // wait for a random good delay before clicking
  setTimeout(async ()=>{
    logger.debug("Trigger map() function call")
    await h.click()
  }, 4000 + Math.random() * 2000)
} catch(v){
  logger.fatal("Cannot locate the explore button, probably the map is unable to be initialized?")
  throw "exit"
}
// Eternally waits until maplibre_map_extracted is true
while (!maplibre_map_extracted) {
  await sleep(100)
}

// disable debugger again we dont need it
await devtools.send("Debugger.disable")
devtools.removeAllListeners()

logger.debug("doned")
const mc = fs.readFileSync(metadataFile).toString("utf-8")
logger.debug("Metadata file: ",metadataFile)

// actual work
const metadata: {
  img: string,
  bounds: [
    // topleft
    [number, number], 
    // bottomright
    [number, number]
  ]
}[] = JSON.parse(mc)

logger.info("Capturing images")


for (const m of metadata) {
  logger.debug(`${m.img} ${m.bounds}`)
  // run ${__maplibre_map}.fitBounds(m.bounds, {animate: false}) and wait for 2s
  const expression = `window.${mapobj_name}.fitBounds(${JSON.stringify(m.bounds)}, {animate: false, duration: 0})`
  logger.debug(expression)
  await devtools.send("Runtime.evaluate", {
    expression 
  })
  // give it 10s to download stuff
  await sleep(10000)

  // figure out the aspect ratio of the bounds and calculate the new viewport width/height depending on whichever other axis is larger
  const latDiff = Math.abs(m.bounds[1][0] - m.bounds[0][0])
  const lonDiff = Math.abs(m.bounds[0][1] - m.bounds[1][1])
  let newWidth = 1920
  let newHeight = 1080
  const targetAspect = 1920 / 1080
  const boundsAspect = lonDiff / latDiff
  if (boundsAspect > targetAspect) {
    // wider than target, adjust height
    newHeight = Math.round(newWidth / boundsAspect)
  } else {
    // taller than target, adjust width
    newWidth = Math.round(newHeight * boundsAspect)
  }

  await page.setViewport({width: newWidth, height: newHeight});

  await (await page.locator("canvas.maplibregl-canvas").waitHandle()).screenshot({
    // @ts-ignore
    path: saveFolder + "/" + m.img
  })

  // Location check
  // Click the center of the screen, wait for a bit, then logs the "location" localStorage item to console
  const centerPos = {x: Math.floor(newWidth / 2), y: Math.floor(newHeight / 2)}
  await page.mouse.click(centerPos.x, centerPos.y)
  await new Promise((r) => setTimeout(r, 400))
  const loc = await devtools.send("Runtime.evaluate", {
    expression: `localStorage.getItem("location")`
  })
  logger.info(`Captured ${m.img} at location ${loc.result.value}`),
  await new Promise((r)=>setTimeout(r, 1000));
  await (await page.$("body div.absolute.bottom-0.left-0.z-50.w-full.sm\\:left-1\\/2.sm\\:max-w-md.sm\\:-translate-x-1\\/2.md\\:max-w-lg > div > div > div.flex.gap-2.px-3 > button"))!.click()
}
} catch(e){
  // log the error
  logger.fatal("An error occurred: ", e)
  process.exitCode = 1
} finally {

await rec?.stop()
await devtools.detach()
await page.close()
await browser.close()

logger.info("Done!")
}
