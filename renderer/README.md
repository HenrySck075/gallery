This script saves images of wplace arts specified through a metadata file **at the time it was requested**

# Requirements
- Node.js at whatever version idk
- Playwright and a Chromium browser
    + Anything that is not Chrome (and Termux users) (me) must specify the following environment variables to be lauched by the script:
    ```
    PLAYWRIGHT_BROWSERS_PATH=0
    CHROMIUM_PATH=/path/to/chromium-based-browser
    ```
- Your precious time waiting for your headless browser to go through every single coordinates provided, take a snapshot of it, and save it to the disk (if any)
