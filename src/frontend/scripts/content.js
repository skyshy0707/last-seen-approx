async function importModule(path) {
    const src = await chrome.runtime.getURL(path)
    const module = await import(src)
    return module
}

function getCookie(name){
    let cookieStore = document.cookie.split("; ")
    for (let i = 0; i < cookieStore.length; i++){
        let cookieRow = cookieStore[i].split("=")
        if (name == cookieRow[0]){
            return cookieRow[1]
        }
    }
    return null
}


async function _findBlock(
    mutations, 
    observer, 
    targetSelectorName="yt-subscribe-button-view-model"
){
    for (let mutation of mutations){
        for (let node of mutation.addedNodes){
            if (!(node instanceof HTMLElement)) continue

            if (node.matches(targetSelectorName)){
                return node
            }
            if (node.matches('#content')){
                console.log(`CONTENT founded: ${node} ${new Date()}`)

                let subscribe = document.querySelector("yt-flexible-actions-view-model")
                if (!subscribe){
                    subscribe = await findBlock(
                        (targetNode) => {console.log(`FOUND TARGET NODE: ${targetNode}`)},
                        document,
                        "yt-flexible-actions-view-model",
                        stopWhenFound=true
                    )
                }
                await draftMenuButton(subscribe)
            }
        }
    }
    return null
}
async function findBlock(cb, node, targetSelectorName="yt-subscribe-button-view-model", stopWhenFound=false){

    const promise = new Promise((resolve, reject) => {
        new MutationObserver(
            async (mutations, observer) => {
                try {
                    let subscribe = await _findBlock(mutations, observer, targetSelectorName)
                    cb(subscribe)
                    if (subscribe){
                        if (stopWhenFound){
                            observer.disconnect()
                        }
                        resolve(subscribe) 
                    }
                    subscribe = document.querySelector(targetSelectorName)
                    if (subscribe){
                        if (stopWhenFound){
                            observer.disconnect()
                        }
                        resolve(subscribe)
                    }

                    
                }
                catch (error) {
                    console.log(`Error occur while finding subscribe block ${error.stack}, error attrs: ${Object.keys(error)}`)
                    reject(error)
                }
            }
        ).observe(
            node, 
            { attributes: true, childList: true, subtree: true, characterData: true }
        )
    })

    let result = await Promise.resolve(promise)
    return result
}  

async function loadMenu(cb, errorOccur=false){
    
    var subscribe = await findBlock(
        cb, document, 
        "yt-flexible-actions-view-model"
    )
    await draftMenuButton(subscribe)
}


async function draftMenuButton(subscribe){


    const ls = await importModule('scripts/modules/last-seen.js')
    const hasMenu = subscribe.getElementsByClassName("last-seen-align")
    const menu = document.createElement("div")
    const lastSeenBtn =  document.createElement("button")

    const lastUsing = new Date(getCookie("last_check"))
    lastUsing.setHours(lastUsing.getHours() + 24)
    const msPerDay = 86400000
    const msPerMinute = 60000
    const now = new Date()
    const whenAvailableAgain = lastUsing
    const currentUTCTime = new Date(now.getTime() + now.getTimezoneOffset() * msPerMinute)

    if (!hasMenu.length){
        menu.appendChild(lastSeenBtn)
        subscribe.appendChild(menu)
    }

    if (whenAvailableAgain > currentUTCTime){
        let shadedPart = ((whenAvailableAgain - currentUTCTime) / msPerDay) * 100
        lastSeenBtn.style.setProperty(
            '--temporaryDisable', 
            `conic-gradient(#ff5733 0% ${shadedPart}%, rgb(255, 255, 255, 1) ${shadedPart}% 100%)`
        )
        lastSeenBtn.style.transform = null
        lastSeenBtn.disabled = true
    }
    
    menu.className = "last-seen-align" 
    lastSeenBtn.className = "last-seen-btn"
    lastSeenBtn.type = "button"
    lastSeenBtn.addEventListener('click', ls.getLastSeen)
}

async function addMenu () {

    const urlPatterns = [
        'https://www.youtube.com/@',
        'https://www.youtube.com/channel'
    ]

    var draftMenu = false
    for (let urlPattern of urlPatterns){
        if (location.href.startsWith(urlPattern)){
            draftMenu = true
            break
        }
    }

    if (draftMenu){
        await loadMenu(nodeBlock => {
            console.log(`This returns block ${nodeBlock} main menu at ${new Date()}`) 
        })
    } 
    else console.log("No conditions for drafting menu")
}

addMenu().then(console.log("Menu is drafted")).catch(
    (error) => {
        console.log(`Error occur at adding the menu. Details: ${error} ${error.stack}, error attrs: ${Object.keys(error)}`)
    }
)