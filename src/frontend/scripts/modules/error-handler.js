import { errorHTML } from "./html-bulders.js"

let textErrors = {
    default: "Ой, ошибка. Роботы добрались до нас и устроили рок-концерт. Ждите, мы всё исправим."
}

async function addErrorText(error){
    console.log(`Error debug: ${Object.keys(error)}`)
    console.log(`Error: ${error}`)
    let lastSeenDataContainer = document.querySelector(".last-seen-data-container")

    if (lastSeenDataContainer){
        lastSeenDataContainer.remove()
    }
    
    lastSeenDataContainer = document.createElement("div")
    lastSeenDataContainer.className = "last-seen-data-container"
    lastSeenDataContainer.innerHTML = await errorHTML()

    const dataText = document.createElement("strong")
    const commonDiv =  document.querySelector("yt-flexible-actions-view-model")
    const lastSeenBtn = document.querySelector(".last-seen-align")
    const lastSeenData = lastSeenDataContainer.querySelector(".last-seen-text-container")

    dataText.innerText = error.message || textErrors.default
    lastSeenBtn ? lastSeenBtn.remove() : console.log("Button \'last-seen\' was removed")
    lastSeenData.appendChild(dataText)
    commonDiv.appendChild(lastSeenDataContainer)
}

export { addErrorText }