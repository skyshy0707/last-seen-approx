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
                //observer.disconnect()
                console.log(`node founded ${node}`)
                return node
            }

            if (node.matches("#contentContainer")){
                console.log(`ContentHeader founded: ${node} ${new Date()}`)
            }
            if (node.matches('#header')){
                console.log(`Header founded: ${node} ${new Date()}`)
            }
            if (node.matches('#wrapper')){
                console.log(`Wrapper founded: ${node} ${new Date()}`)
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
            /*else {
                console.log(`Go on ${targetSelectorName}, found node: ${node.nodeName}, attrs: ${node.attributes}, class: ${node.classList}`)
                if (node.parentNode){
                    console.log(`parent: ${node.parentNode.nodeName}`)
                }
                if (node.parentNode && node.parentNode.parentNode){
                    console.log(`pre-parent: ${node.parentNode.parentNode.nodeName}`)
                }
                if (node.parentNode && node.parentNode.parentNode && node.parentNode.parentNode.parentNode){
                    console.log(`pre-pre-parent: ${node.parentNode.parentNode.parentNode.nodeName}`)
                }
                if (
                    node.parentNode 
                    && node.parentNode.parentNode 
                    && node.parentNode.parentNode.parentNode 
                    && node.parentNode.parentNode.parentNode.parentNode
                ){
                    console.log(`pre-pre-pre-parent: ${node.parentNode.parentNode.parentNode.parentNode.nodeName}`)
                }
                if (
                    node.parentNode 
                    && node.parentNode.parentNode 
                    && node.parentNode.parentNode.parentNode 
                    && node.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode
                ){
                    console.log(`pre-pre-pre-pre-parent: ${node.parentNode.parentNode.parentNode.parentNode.parentNode.nodeName}`)
                }
                if (
                    node.parentNode 
                    && node.parentNode.parentNode 
                    && node.parentNode.parentNode.parentNode 
                    && node.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
                ){
                    console.log(`5th-parent: ${node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.nodeName}`)
                }
                if (
                    node.parentNode 
                    && node.parentNode.parentNode 
                    && node.parentNode.parentNode.parentNode 
                    && node.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
                ){
                    console.log(`6th-parent: ${node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.nodeName}`)
                }
                if (
                    node.parentNode 
                    && node.parentNode.parentNode 
                    && node.parentNode.parentNode.parentNode 
                    && node.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
                ){
                    console.log(`6th-parent: ${node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.nodeName}`)
                }
                if (
                    node.parentNode 
                    && node.parentNode.parentNode 
                    && node.parentNode.parentNode.parentNode 
                    && node.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
                ){
                    console.log(`7th-parent: ${node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.nodeName}`)
                }
                if (
                    node.parentNode 
                    && node.parentNode.parentNode 
                    && node.parentNode.parentNode.parentNode 
                    && node.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
                ){
                    console.log(`8th-parent: ${node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.nodeName}`)
                }
                if (
                    node.parentNode 
                    && node.parentNode.parentNode 
                    && node.parentNode.parentNode.parentNode 
                    && node.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
                    && node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
                ){
                    console.log(`9th-parent: ${node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.nodeName}`)
                }
            }*/
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
                        console.log(`subscribe node founded ${subscribe}`)
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
                        //observer.disconnect()
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

    let result
    try{
        result = await Promise.resolve(promise)
    }
    catch(error){
        console.log(`Error at reject result: ${error}`)
        throw error
    }
    console.log(`represent result: ${result}`)
    return result
}  

async function loadMenu(cb, errorOccur=false){

    var pageHeader = document
    console.log("node", pageHeader) 
    var subscribe = document.querySelector("yt-flexible-actions-view-model")

    console.log(`Try to init subscribe block: ${subscribe}`)

    //let wizAct = findBlock(cb, pageHeader, ".yt-flexible-actions-view-model-wiz__action-row")//21
    //let animated = findBlock(cb, pageHeader, "yt-animated-action")

    ".animated-action__content-with-background > .animated-action__lottie > lottie-component > svg"
    "yt-animated-action > .animated-action__lottie > .ytLottieComponentHost > svg"
    ".yt-subscribe-button-view-model-wiz__invisible"
    "yt-subscribe-button-view-model"
    ".yt-flexible-actions-view-model-wiz__action"

    "#__lottie_element_84" //1
    "yt-animated-action > .animated-action__lottie > .ytLottieComponentHost > svg > g > g"
    "#__lottie_element_64" //20
    "#__lottie_element_64 > rect" //19
    "#__lottie_element_65" //18
    "#__lottie_element_65 > g > path" //17
    "#__lottie_element_68" //16
    "#__lottie_element_68 > stop" //15
    "#__lottie_element_65_1" //14
    "#__lottie_element_65_1 > use" //13
    "#__lottie_element_72" //12
    "#__lottie_element_72 > g > path" //11
    "#__lottie_element_75" //10
    "#__lottie_element_75 > stop" //9
    "#__lottie_element_72_1" //8
    "#__lottie_element_72_1 > use" //7
    "[clip-path='url(#__lottie_element_64)']" //6
    "[clip-path='url(#__lottie_element_65_1)']"
    "#__lottie_element_79" //5
    "#__lottie_element_79 > rect" //4
    "[clip-path='url(#__lottie_element_79)'] > g > g > [fill-opacity='0']" //3
    "[clip-path='url(#__lottie_element_79)'] > g > g > [fill-opacity='1']" //2
    ".yt-spec-button-shape-next__secondary-icon > yt-icon > span > div > svg > path"
    ".yt-subscribe-button-view-model-wiz__container > .yt-spec-button-shape-next > yt-touch-feedback-shape > div > .yt-spec-touch-feedback-shape__stroke"
    ".yt-subscribe-button-view-model-wiz__container > .yt-spec-button-shape-next > yt-touch-feedback-shape > div > .yt-spec-touch-feedback-shape__fill"
    ".yt-spec-button-shape-next__button-text-cont.yt-spec-button-shape-next--tonal.yt-spec-button-shape-next--mono.yt-spec-button-shape-next--size-m.yt-spec-button-shape-next--icon-leading-trailing.yt-spec-button-shape-next--disable-text-ellipsis.yt-spec-button-shape-next--enable-backdrop-filter-experiment > .yt-spec-button-shape-next__button-text-contentent"


    /*
    let lottie84 = findBlock(cb, pageHeader, "#__lottie_element_84")
    let lottie84gs = findBlock(cb, pageHeader, "yt-animated-action > .animated-action__lottie > .ytLottieComponentHost > svg > g > g")
    let lottie64 = findBlock(cb, pageHeader, "#__lottie_element_64")
    let lottie64rect = findBlock(cb, pageHeader, "#__lottie_element_64 > rect")
    let lottie65 = findBlock(cb, pageHeader, "#__lottie_element_65")
    let lottie65path = findBlock(cb, pageHeader, "#__lottie_element_65 > g > path")
    let lottie68 = findBlock(cb, pageHeader, "#__lottie_element_68")
    let lottie68stop = findBlock(cb, pageHeader, "#__lottie_element_68 > stop")
    let lottie65_1 = findBlock(cb, pageHeader, "#__lottie_element_65_1")
    let lottie65_1use = findBlock(cb, pageHeader, "#__lottie_element_65_1 > use")
    let lottie72 = findBlock(cb, pageHeader, "#__lottie_element_72")
    let lottie72path = findBlock(cb, pageHeader, "#__lottie_element_72 > g > path")
    let lottie75 = findBlock(cb, pageHeader, "#__lottie_element_75")
    let lottie75stop = findBlock(cb, pageHeader, "#__lottie_element_75 > stop")
    let lottie72_1 = findBlock(cb, pageHeader, "#__lottie_element_72_1")
    let lottie72_1use = findBlock(cb, pageHeader, "#__lottie_element_72_1 > use")
    let clippath64 = findBlock(cb, pageHeader, "[clip-path='url(#__lottie_element_64)']")
    let clippath65_1 = findBlock(cb, pageHeader, "[clip-path='url(#__lottie_element_65_1)']")
    let lottie79 = findBlock(cb, pageHeader, "#__lottie_element_79")
    let lottie79rect = findBlock(cb, pageHeader, "#__lottie_element_79 > rect")
    let clippath79_op0 = findBlock(cb, pageHeader, "[clip-path='url(#__lottie_element_79)'] > g > g > [fill-opacity='0']")
    let clippath79_op1 = findBlock(cb, pageHeader, "[clip-path='url(#__lottie_element_79)'] > g > g > [fill-opacity='1']")
    let ytIconSvg = findBlock(cb, pageHeader, ".yt-spec-button-shape-next__secondary-icon > yt-icon > span > div > svg > path")
    let subscribeBtnStroke = findBlock(cb, pageHeader, ".yt-subscribe-button-view-model-wiz__container > .yt-spec-button-shape-next > yt-touch-feedback-shape > div > .yt-spec-touch-feedback-shape__stroke")
    let subscribeBtnFill = findBlock(cb, pageHeader, ".yt-subscribe-button-view-model-wiz__container > .yt-spec-button-shape-next > yt-touch-feedback-shape > div > .yt-spec-touch-feedback-shape__fill")
    let specBtnContent = findBlock(cb, pageHeader, ".yt-spec-button-shape-next__button-text-cont.yt-spec-button-shape-next--tonal.yt-spec-button-shape-next--mono.yt-spec-button-shape-next--size-m.yt-spec-button-shape-next--icon-leading-trailing.yt-spec-button-shape-next--disable-text-ellipsis.yt-spec-button-shape-next--enable-backdrop-filter-experiment > .yt-spec-button-shape-next__button-text-contentent")



    let svg1 = findBlock(cb, pageHeader, ".animated-action__content-with-background > .animated-action__lottie > lottie-component > svg")
    let svg2 = findBlock(cb, pageHeader, "yt-animated-action > .animated-action__lottie > .ytLottieComponentHost > svg")
    let subscribeInv = findBlock(cb, pageHeader, ".yt-subscribe-button-view-model-wiz__invisible")
    let subscribe1 = findBlock(cb, pageHeader, "yt-subscribe-button-view-model")
    let wizAvtMain = findBlock(cb, pageHeader, ".yt-flexible-actions-view-model-wiz__action")


    wizAct.then(element => console.log(`Element wizAct: ${element}`))
    animated.then(element => console.log(`Element animated: ${element}`))

    svg1.then(element => console.log(`Element svg1: ${element}`))
    svg2.then(element => console.log(`Element svg2: ${element}`))
    subscribeInv.then(element => console.log(`Element subscribeInv: ${element}`))
    subscribe1.then(element => console.log(`Element subscribe1: ${element}`))
    wizAvtMain.then(element => console.log(`Element wizAvtMain: ${element}`))

    lottie84.then(element => console.log(`Element lottie84 ${element}`))
    lottie84gs.then(element => console.log(`Element lottie84gs: ${element}`))
    lottie64.then(element => console.log(`Element lottie64: ${element}`))
    lottie64rect.then(element => console.log(`Element lottie64rect: ${element}`))
    lottie65.then(element => console.log(`Element lottie65: ${element}`))
    lottie65path.then(element => console.log(`Element lottie65path: ${element}`))
    lottie68.then(element => console.log(`Element lottie68: ${element}`))
    lottie68stop.then(element => console.log(`Element lottie68stop: ${element}`))
    lottie65_1.then(element => console.log(`Element lottie65_1: ${element}`))
    lottie65_1use.then(element => console.log(`Element lottie65_1use: ${element}`))
    lottie72.then(element => console.log(`Element lottie72: ${element}`))
    lottie72path.then(element => console.log(`Element lottie72path: ${element}`))
    lottie75.then(element => console.log(`Element lottie75: ${element}`))
    lottie75stop.then(element => console.log(`Element lottie75stop: ${element}`))
    lottie72_1.then(element => console.log(`Element lottie72_1: ${element}`))
    lottie72_1use.then(element => console.log(`Element lottie72_1use: ${element}`))
    clippath64.then(element => console.log(`Element clippath64: ${element}`))
    clippath65_1.then(element => console.log(`Element clippath65_1: ${element}`))
    lottie79.then(element => console.log(`Element lottie79: ${element}`))
    lottie79rect.then(element => console.log(`Element lottie79rect: ${element}`))
    clippath79_op0.then(element => console.log(`Element clippath79_op0: ${element}`))
    clippath79_op1.then(element => console.log(`Element clippath79_op1: ${element}`))
    ytIconSvg.then(element => console.log(`Element ytIconSvg: ${element}`))
    subscribeBtnStroke.then(element => console.log(`Element subscribeBtnStroke: ${element}`))
    subscribeBtnFill.then(element => console.log(`Element subscribeBtnFill: ${element}`))
    specBtnContent.then(element => console.log(`Element specBtnContent: ${element}`))*/

    

    
    //let clippath79_op0 = await findBlock(cb, pageHeader, "[clip-path='url(#__lottie_element_79)'] > g > g > [fill-opacity='0']")
    //let clippath79_op1 = await findBlock(cb, pageHeader, "[clip-path='url(#__lottie_element_79)'] > g > g > [fill-opacity='1']")
    
    //await new Promise(result => setTimeout(() => console.log("Sleep force"), 20000))
    /*console.log("Next, find last mutated element in the yt-flexible-actions-view-model element: ")
    let lottie84 = await findBlock(cb, pageHeader, "#__lottie_element_84")
    console.log(`Last mutated element was foumd: ${lottie84}, ${new Date()}`)

    

    console.log("Next, find last mutated element in the yt annoncer element: ")
    let annon = await findBlock(cb, pageHeader, "tp-yt-iron-a11y-announcer")
    console.log(`Mutated element annoncer was found: ${annon}, ${new Date()}`)

    console.log("Next, find mutated tab-group-shape element: ")
    let tabGroupShape = await findBlock(cb, pageHeader, "yt-tab-group-shape")
    console.log(`Mutated tab-group-shape element was found: ${tabGroupShape}, ${new Date()}`)

    "yt-subscribe-button-view-model > yt-animated-action"
    //console.log(`wiz action: ${wizAct}`)
    console.log(`documents state: ${document.readyState}, ${document.isConnected}`)*/
    //return

    /*if (!subscribe){
        console.log("Condition /not subscribe/")
        subscribe = document.querySelector("yt-flexible-actions-view-model")
        if (!subscribe){
            subscribe = await findBlock(
                cb, pageHeader, 
                "yt-flexible-actions-view-model"
            )
        }
        
        //console.log(`subscribeBtn 1st stage: ${subscribeBtn}`)
        //subscribe = subscribeBtn
    }*/


    subscribe = document.querySelector("yt-flexible-actions-view-model")
    if (!subscribe){
        console.log("Condition /not subscribe/")
    }

    subscribe = await findBlock(
        cb, pageHeader, 
        "yt-flexible-actions-view-model"
    )


    console.log("КОНЕЦ ЦИКЛА ПОИСКА ЦЕЛЕВОГО БЛОКА")
    /*else {
        let mutated = await findBlock(
            cb, document, 
            "div"
        )
        console.log(`mutated block detected: ${mutated}`)
    }*/
    /*document.addEventListener("change", (event) => {
        console.log("!!! yt-flexible-actions-view-model changed")
        draftMenuButton(subscribe)
    })*/
    //subscribe.addEventListener("DOMNodeInserted", (event) => draftMenuButton(event.target))

    await draftMenuButton(subscribe)


    /*console.log("КОНЕЦ ЦИКЛА ПОИСКА ЦЕЛЕВОГО БЛОКА")

    let hasMenu = subscribe.getElementsByClassName("last-seen-align")
    const menu = document.createElement("div")
    const lastSeenBtn =  document.createElement("button")

    menu.className = "last-seen-align" 
    lastSeenBtn.className = "last-seen-btn"
    lastSeenBtn.type = "button"

    if (!hasMenu.length){
        
        console.log(`Subscribe now have been using inside loadMenu ${subscribe}`)
        
        //console.log(`subscribe: ${subscribe.className}`)
        //console.log(`commonDiv: ${commonDiv.className}`)
        menu.appendChild(lastSeenBtn)
        subscribe.appendChild(menu)
    }
    else console.log("Menu have added yet")

    console.log(`last check in cookie ${getCookie("last_check")}`)
    let lastCheck = new Date(getCookie("last_check"))
    console.log(`$last check: ${lastCheck}`)
    const msPerDay = 86400000
    lastCheck.setHours(lastCheck.getHours() + 24)
    const availableAgain = lastCheck
    console.log(`available again: ${availableAgain}`)
    const now = new Date()
    const tzOffset = now.getTimezoneOffset()
    const currentUTCTime = new Date(now.getTime() + tzOffset * 60000)

    console.log(`now: ${now}`)
    console.log(`currentUTCTime: ${currentUTCTime}`)
    if (availableAgain > currentUTCTime){
        console.log("shaded")
        let shadedPart = ((availableAgain - currentUTCTime) / msPerDay) * 100
        lastSeenBtn.style.setProperty(
            '--temporaryDisable', 
            `conic-gradient(#ff5733 0% ${shadedPart}%, rgb(255, 255, 255, 1) ${shadedPart}% 100%)`
        )
        lastSeenBtn.style.transform = null
        lastSeenBtn.disabled = true
    }

    const ls = await importModule('scripts/modules/last-seen.js')

    lastSeenBtn.addEventListener('click', ls.getLastSeen)

    console.log("It seems event click was added")*/
}


async function draftMenuButton(subscribe){
    let hasMenu = subscribe.getElementsByClassName("last-seen-align")
    const menu = document.createElement("div")
    const lastSeenBtn =  document.createElement("button")

    menu.className = "last-seen-align" 
    lastSeenBtn.className = "last-seen-btn"
    lastSeenBtn.type = "button"

    if (!hasMenu.length){
        
        console.log(`Subscribe now have been using inside loadMenu ${subscribe}`)
        menu.appendChild(lastSeenBtn)
        subscribe.appendChild(menu)
    }
    else console.log("Menu have added yet")

    console.log(`last check in cookie ${getCookie("last_check")}`)
    let lastCheck = new Date(getCookie("last_check"))
    console.log(`$last check: ${lastCheck}`)
    const msPerDay = 86400000
    lastCheck.setHours(lastCheck.getHours() + 24)
    const availableAgain = lastCheck
    console.log(`available again: ${availableAgain}`)
    const now = new Date()
    const tzOffset = now.getTimezoneOffset()
    const currentUTCTime = new Date(now.getTime() + tzOffset * 60000)

    console.log(`now: ${now}`)
    console.log(`currentUTCTime: ${currentUTCTime}`)
    if (availableAgain > currentUTCTime){
        console.log("shaded")
        let shadedPart = ((availableAgain - currentUTCTime) / msPerDay) * 100
        lastSeenBtn.style.setProperty(
            '--temporaryDisable', 
            `conic-gradient(#ff5733 0% ${shadedPart}%, rgb(255, 255, 255, 1) ${shadedPart}% 100%)`
        )
        lastSeenBtn.style.transform = null
        lastSeenBtn.disabled = true
    }

    const ls = await importModule('scripts/modules/last-seen.js')

    lastSeenBtn.addEventListener('click', ls.getLastSeen)

    console.log("It seems event click was added")
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
    console.log(`document state: ${document.readyState}`)
    console.log(`is condition to draft menu: ${draftMenu}`)
    if (draftMenu){
        await loadMenu(nodeBlock => {
            console.log(`This returns block ${nodeBlock} main menu at ${new Date()}`) 
        })
    } 
}

addMenu().then(console.log("Menu is drafted")).catch(
    (error) => {console.log(`Error occur at adding the menu. Details: ${error} ${error.stack}, error attrs: ${Object.keys(error)}`)}
)