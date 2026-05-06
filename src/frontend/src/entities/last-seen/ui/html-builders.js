import styles from "../../../shared/assets/css/main.css.js"
import { innerHTML } from "../../../shared/utils/utils.js"

async function lastSeenHTML() {
    return await innerHTML('src/entities/last-seen/ui/templates/last-seen-data.html')
}

async function errorHTML(){
    let text =  await innerHTML('src/entities/last-seen/ui/templates/error-data.html')
    console.log(`text: ${text}`)
    return text
}

async function waitHTML(){
    return await innerHTML('src/entities/last-seen/ui/templates/wait.html')
}

export {
    lastSeenHTML,
    errorHTML,
    waitHTML
}