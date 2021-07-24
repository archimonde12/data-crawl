
import { startBrowser } from "./browser"
import { startFastifyServer } from "./fastify"
import { createNewTopic } from "./utils";




(async () => {
    try {
        await startBrowser()
        await startFastifyServer()
    } catch (e) {
        console.log(e)
    }

})();