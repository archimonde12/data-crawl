import { Browser, Page } from "puppeteer"
import { launch } from "puppeteer"

export let browser: Browser
export let page: Page
// const phone = "813020103"
// const phone = "392008300"
// const phone="342343716"
const phone = "356100460"

export let step = 0
export const sleep = (ms: number) => {
    return new Promise((res, rej) => {
        setTimeout(() => {
            step++
            res("OK")
        }, Math.floor((ms / 2) + Math.random() * (ms / 2)))
    })
}

export const startBrowser = async () => {
    try {
        browser = await launch()
        page = await browser.newPage()
        const goToGoogle = async () => {
            await page.goto(`https://www.google.com/`)
            await sleep(5000)
            await page.screenshot({ path: `step-screenshot/step-${step}.png` });
        }

        const goToTelegram = async () => {
            await page.goto('https://web.telegram.org/k/');
            await sleep(15000)
            await page.screenshot({ path: `step-screenshot/step-${step}.png` });
            await page.click("div.c-ripple")
            await sleep(6000)
            await page.screenshot({ path: `step-screenshot/step-${step}.png` });
            page.type("div.input-field.input-select input.input-field-input", "Vietnam", { delay: 100 })
            await sleep(6000)
            await page.screenshot({ path: `step-screenshot/step-${step}.png` });
            await page.click("div.select-wrapper.z-depth-3.active", { delay: 100 })
            await sleep(6000)
            await page.screenshot({ path: `step-screenshot/step-${step}.png` });
            page.type("div.input-field input.input-field-input[name='phone']", phone, { delay: 100 })
            await sleep(6000)
            await page.screenshot({ path: `step-screenshot/step-${step}.png` });
            await page.click("button.btn-primary.btn-color-primary.rp div.c-ripple", { delay: 100 })
            await sleep(6000)
            await page.screenshot({ path: `step-screenshot/step-${step}.png` });
        }
        return {
            goToGoogle,
            goToTelegram
        }
    }
    catch (e) {
        throw e
    }
}