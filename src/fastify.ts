import { FastifyReply, FastifyRequest } from "fastify"
import { browser, page, sleep, step } from "./browser"
import fs from "fs"
import { allAddress, createNewTopic, getAllTopic, handleDuplicateAddress, handleMessages, saveAllAddress, setTopic } from "./utils"
export const startFastifyServer = async () => {
    try {
        const server = require('fastify')()
        // server.route({
        //     url: '/start',
        //     method: 'POST',
        //     handler: async (req: FastifyRequest, rep: FastifyReply) => {
        //         try {
        //             await browser.close();
        //             rep.send("OK")
        //         } catch (e) {
        //             throw e
        //         }
        //     }
        // })
        server.route({
            url: '/end',
            method: 'POST',
            handler: async (req: FastifyRequest, rep: FastifyReply) => {
                try {
                    await browser.close();
                    rep.send("OK")
                } catch (e) {
                    throw e
                }
            }
        })

        server.route({
            url: '/insertCode',
            method: 'POST',
            handler: async (req: FastifyRequest, rep: FastifyReply) => {
                try {
                    const body = req.body as { code: string, selectorQuery: string }
                    console.log(body)

                    await page.keyboard.type(body.code, { delay: 100 })


                    // await page.type(body.selectorQuery, body.code, { delay: 100 })

                    await sleep(1000)
                    await page.screenshot({ path: `step-screenshot/step-${step}-insert.png` });
                    rep.send("OK")
                } catch (e) {
                    throw e
                }
            }
        })
        server.route({
            url: '/screenshot',
            method: 'POST',
            handler: async (req: FastifyRequest, rep: FastifyReply) => {
                try {
                    await sleep(1000)
                    await page.screenshot({ path: `step-screenshot/step-${step}-screenshot.png` });
                    const path = "src/context.html"
                    let writeStream = fs.createWriteStream(path)
                    writeStream.write(await page.content())
                    rep.send("OK")
                } catch (e) {
                    throw e
                }
            }
        })

        server.route({
            url: '/enter',
            method: 'POST',
            handler: async (req: FastifyRequest, rep: FastifyReply) => {
                try {
                    await page.keyboard.down("Enter")
                    await sleep(1000)
                    await page.screenshot({ path: `step-screenshot/step-${step}-enter.png` });
                    rep.send("OK")
                } catch (e) {
                    throw e
                }
            }
        })

        server.route({
            url: '/wheel',
            method: 'POST',
            handler: async (req: FastifyRequest, rep: FastifyReply) => {
                try {
                    const body = req.body as { deltaY: number, deltaX: number }
                    await page.mouse.wheel({
                        deltaX: body.deltaX,
                        deltaY: body.deltaY
                    })
                    await sleep(1000)
                    await page.screenshot({ path: `step-screenshot/step-${step}-wheel.png` });
                    rep.send("OK")
                } catch (e) {
                    throw e
                }
            }
        })

        server.route({
            url: '/click',
            method: 'POST',
            handler: async (req: FastifyRequest, rep: FastifyReply) => {
                try {
                    const body = req.body as { selectorQuery: string }
                    await page.click(body.selectorQuery, { delay: 100, clickCount: 2 })
                    await sleep(1000)
                    await page.screenshot({ path: `step-screenshot/step-${step}-click.png` });
                    rep.send("OK")
                } catch (e) {
                    throw e
                }
            }
        })


        server.route({
            url: '/crawl-data',
            method: 'POST',
            handler: async (req: FastifyRequest, rep: FastifyReply) => {
                try {
                    const body = req.body as { selectorQuery: string, topic: string, type: string }
                    const { selectorQuery, topic, type } = body

                    if (!type) return rep.send("Type missing")
                    if (!topic) return rep.send("Topic missing")
                    let isEnd = false
                    if (type === "history") {
                        while (!isEnd) {
                            let allMessages = await page.evaluate(() => Array.from(document.querySelectorAll("div.message")).map(a => a.textContent)) as string[]

                            let allTime = await page.evaluate(() => Array.from(document.querySelectorAll("span.time.tgico")).map(a => a.getAttribute("title"))) as string[]

                            const allTopics = getAllTopic()

                            const topicData = allTopics.find(el => el.name === topic)

                            if (topicData) {
                                const index = allTime.findIndex(el => el === topicData.timeStart)

                                if (index === 0) { isEnd = true; break; }
                                allMessages = allMessages.filter((el, i) => i < index)
                            } else {
                                createNewTopic(topic, allTime[0], allTime[allTime.length - 1])
                                await sleep(2000)
                            }

                            setTopic(topic, allTime[0])
                            saveAllAddress(allMessages, topic)
                            await page.mouse.wheel({
                                deltaY: -10000
                            })
                            await sleep(2000)
                            await page.screenshot({ path: `step-screenshot/step-${step}-crawl-data.png` });
                        }
                    }
                    if (type === "continue") {
                        while (!isEnd) {
                            let allMessages = await page.evaluate(() => Array.from(document.querySelectorAll("div.message")).map(a => a.textContent)) as string[]
                            let allTime = await page.evaluate(() => Array.from(document.querySelectorAll("span.time.tgico")).map(a => a.getAttribute("title"))) as string[]
                            const allTopics = getAllTopic()
                            const topicData = allTopics.find(el => el.name === topic)

                            if (topicData) {
                                const index = allTime.findIndex(el => el === topicData.timeEnd)

                                if (index < 0) { isEnd = true; break; }
                                allMessages = allMessages.filter((el, i) => i < index)
                            } else {
                                await sleep(2000)
                                await rep.send("Topic not exist")
                                break;
                            }

                            setTopic(topic, allTime[0])
                            saveAllAddress(allMessages, topic)
                            await page.mouse.wheel({
                                deltaY: -10000
                            })
                            await sleep(2000)
                            await page.screenshot({ path: `step-screenshot/step-${step}-crawl-data.png` });
                        }
                    }
                    return rep.send("OK")
                    // console.log(selectorQuery)
                    // //Click to the top
                    // for (let i = 0; i < times; i++) {
                    //     console.log(`index=${i}`)
                    //     await page.click(selectorQuery, { delay: 500 })
                    //     await page.screenshot({ path: `step-screenshot/step-${step}-crawl-data.png` });

                    // }

                    // //Wait 2000s
                    // await sleep(2000)

                    // //Get all data


                    // console.log(allMessages)
                    // saveAllAddress(allMessages, allTime)
                    // rep.send("OK")
                } catch (e) {
                    throw rep.send(e)
                }
            }
        })



        // "selectorQuery":"li[data-peer-id='-1462236688']"
        const host = await server.listen(8000, '0.0.0.0')

        console.log(`🚀 crawl api ready at ${host}`)
    } catch (e) {
        throw e
    }

}