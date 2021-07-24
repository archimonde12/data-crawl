import fs from "fs"
export const handleMessageToTrxAddress = (msg: string) => {
    const addresses = msg.split(" ").filter(value => value.length === 34)
    return addresses
}

const trxRegex = /(T[A-Za-z0-9]{33})/g
export let startTime = ""
export let endTime = ""
export let allAddress: string[] = []
export const handleMessages = (messages: (string | null)[]) => {
    for (let i = 0; i < messages.length; i++) {
        let message = messages[i]
        if (message) {
            let slicedMessage = message.match(trxRegex)
            if (slicedMessage) {
                allAddress.push(...slicedMessage)
            }
        }

    }
    return allAddress
}
export const handleDuplicateAddress = (addresses: string[]) => {
    let result: any = {}

    for (let i = 0; i < addresses.length; i++) {
        if (!result[addresses[i]]) {
            result[addresses[i]] = 1

        } else {
            result[addresses[i]]++
        }
    }
    return result
}

export const setAllAddress = () => {
    const value = JSON.parse(fs.readFileSync("./addressData/address.json").toString())
    allAddress = [...value]
}

export const saveAllAddress = (data: (string | null)[], topic: string) => {
    const allAddress = handleMessages(data)
    const allNoDupAddress = handleDuplicateAddress(allAddress)
    console.log(allNoDupAddress)
    const dataCount = Object.values(allNoDupAddress)
    const dataAddress = Object.keys(allNoDupAddress)
    const writeStream = fs.createWriteStream(`./addressData/${topic}.csv`)
    writeStream.write(`address,count\n`)
    dataAddress.forEach((val, index) => {
        writeStream.write(`${val},${dataCount[index]}\n`)
    })
}

const getIndexOfTime = (allTime: (string | null)[]) => {
    const oldTime = JSON.parse(fs.readFileSync("./addressData/time.json").toString()) as { timeStart: string, timeEnd: string }
    const timeStartIndex = allTime.findIndex(value => value === oldTime.timeStart)
    const timeEndIndex = allTime.findIndex(value => value === oldTime.timeEnd)
    if (timeEndIndex >= 0 && timeStartIndex >= 0) return { timeStartIndex, timeEndIndex }
    if (timeEndIndex >= 0 && timeStartIndex > 0) return { timeStartIndex, timeEndIndex }
}


export const getAllTopic = () => {
    const topics = JSON.parse(fs.readFileSync("./addressData/crawl-topic.json").toString()) as { name: string, timeStart: string, timeEnd: string }[]
    return topics
}


export const createNewTopic = (name: string, timeStart: string, timeEnd: string) => {
    const path = "./addressData/crawl-topic.json"
    let topics = JSON.parse(fs.readFileSync(path).toString()) as { name: string, timeStart: string, timeEnd: string }[]
    if (topics.find(el => el.name === name)) throw new Error(`topic with name='${name}'has already exist`)
    topics.push({ name, timeStart, timeEnd })
    const writeStream = fs.createWriteStream(path)
    writeStream.write(JSON.stringify(topics))
    return "OK"
}

export const setTopic = (name: string, timeStart?: string, timeEnd?: string) => {
    const path = "./addressData/crawl-topic.json"
    let topics = JSON.parse(fs.readFileSync(path).toString()) as { name: string, timeStart: string, timeEnd: string }[]
    let index = topics.findIndex(el => el.name === name)
    if (index < 0) throw new Error(`topic with name='${name}'has not exist`)
    topics[index].timeStart = timeStart ? timeStart : topics[index].timeStart
    topics[index].timeEnd = timeEnd ? timeEnd : topics[index].timeEnd
    const writeStream = fs.createWriteStream(path)
    writeStream.write(JSON.stringify(topics))
    return "OK"
}