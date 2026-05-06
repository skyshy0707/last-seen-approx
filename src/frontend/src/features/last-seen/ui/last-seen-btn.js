async function importModule(path) {
    const src = await chrome.runtime.getURL(path)
    const module = await import(src)
    return module
}

class Draft{

    draft(){
        throw Error("Method must be implemented")
    }
}

class DraftLastSeen extends Draft{

    async draft(inNode){
        /*Настраивает параметры DOM и рисует меню*/

        const ls = await importModule('src/entities/last-seen/api/last-seen.js')
        const utils = await importModule('src/shared/utils/utils.js')

        const hasMenu = inNode.getElementsByClassName("last-seen-align")
        const oldData = inNode.getElementsByClassName("last-seen-data-container")
        const menu = document.createElement("div")
        const lastSeenBtn =  document.createElement("button")

        // TO DO: Брать `last_check` в ответе сервера, cookies исключить (ненадёжно)
        const lastUsing = new Date(utils.getCookie("last_check"))
        lastUsing.setHours(lastUsing.getHours() + 24)
        const msPerDay = 86400000
        const msPerMinute = 60000
        const now = new Date()
        const whenAvailableAgain = lastUsing
        const currentUTCTime = new Date(now.getTime() + now.getTimezoneOffset() * msPerMinute)


        if (oldData.length){
            for (let data of oldData){
                data.remove()
            }
        }
        if (!hasMenu.length){

            console.log(`
                hasMenu status: ${hasMenu.length}, 
                subscribe.lenght: ${inNode.length}, 
                subscribe: ${inNode} ${new Date()}
            `)

            menu.appendChild(lastSeenBtn)
            console.log(`innethtml: ${inNode.innerHTML}`)
            inNode.appendChild(menu)
        }

        if (whenAvailableAgain > currentUTCTime){
            let shadedPart = ((whenAvailableAgain - currentUTCTime) / msPerDay) * 100

            lastSeenBtn.style.setProperty(
                '--temporaryDisable', 
                `conic-gradient(#ff5733 0% ${shadedPart}%, 
                rgb(255, 255, 255, 1) ${shadedPart}% 100%)`
            )
            lastSeenBtn.style.transform = null
            lastSeenBtn.disabled = true
        }
        
        menu.className = "last-seen-align" 
        lastSeenBtn.className = "last-seen-btn"
        lastSeenBtn.type = "button"
        lastSeenBtn.addEventListener('click', ls.getLastSeen)
    }
}

export {
    DraftLastSeen
}