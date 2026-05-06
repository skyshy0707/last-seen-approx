import { errorHandler } from "../entities/last-seen/ui/render-state.js"

//console.log(`This is background script ${config.BACKEND_API_URL}`)

'https://www.youtube.com/@'
'https://www.youtube.com/channel'


const urlPatterns = [
    /https:\/\/([m]{1,1}|[w]{3,3}).youtube.com\/(@(?!\/)[\S\-\_]+?\/?[\w]+)$/,
    /https:\/\/([m]{1,1}|[w]{3,3}).youtube.com\/channel\/[\w\-\_]+\/?\/?[\w]+$/
]


const config = chrome.runtime.getManifest().config


async function addMenuChrome(tab){
    var draftMenu = false

    for (let urlPattern of urlPatterns){
        if (tab.url.match(urlPattern)){
            draftMenu = true
            break
        }
    } 

    console.log(`Tab.url in addMenuChrome: ${tab.url}`)

    let target = {
        tabId: tab.tabId || tab.id
    }

    const injectObject = { 
        files: [ "src/features/last-seen/index.js" ],
        target : target
    }
    if (draftMenu){
        try {
            chrome.scripting.executeScript(
                injectObject
            )
        }
        catch (error){
            console.log(`An error occur at draft menu. Details: ${error}`)
        }
    }
    
}

chrome.runtime.onInstalled.addListener(
    async (details) => {
        const [currentTab] = await chrome.tabs.query({active: true, lastFocusedWindow: true})

        let tabId = currentTab ? currentTab.id : null
        let userData = await chrome.identity.getProfileUserInfo()

        console.log(`user id: ${userData.email} ${userData.id}`)


        let token = await chrome.identity.getAuthToken(
            {
                account: {
                    id: userData.id
                },
                interactive: true
            }
        )

        fetch(
            `${config.BACKEND_API_URL}sign-up/?` + new URLSearchParams({
                email: userData.email
            }).toString()
        ).then(async (response) => {
            var data = await response.json()

            chrome.cookies.set(
                {
                    name: 'username',
                    value: userData.email,
                    url: 'https://www.youtube.com'
                }
            )
            
            chrome.cookies.set(
                {
                    name: 'last_check',
                    value: data.last_check,
                    url: 'https://www.youtube.com'
                }
            )
        }).catch((error) => {
            console.log(`Error occur at start app: ${Object.keys(error)}, type: ${typeof(error)}, error: ${error}`)
            let reportError = false
            for (let urlPattern of urlPatterns){
                if (currentTab && currentTab.url.match(urlPattern)){
                    reportError = true
                    break
                }
            }
            if (reportError){
                console.log("ERROR SHOW")
                chrome.scripting.executeScript({
                    args: error,
                    func: errorHandler.main,
                    target: {
                        tabId: tabId
                    }
                })
            }
        })
    }
)

chrome.tabs.onUpdated.addListener(async (tabId, currentTab, tab) => {

    let toDraftMenu = false
    console.log(`currentTab: ${Object.keys(currentTab)} currentTab: ${currentTab.url}, tab.url: ${tab.url}, caurrentTab.status: ${currentTab.status}, tab.id: ${tab.tabId || tab.id}, is no ends at community: ${!tab.url.endsWith('community')}`)
    for (let urlPrefix of urlPatterns){
        if (currentTab.status == 'complete' && tab.url.match(urlPrefix) && !tab.url.endsWith('community')){
            toDraftMenu = true
            break
        }
    }
    if (!toDraftMenu){
        console.log("NO Draft menu")
        return
    }

    console.log("DRAFT MENU")

    chrome.scripting.insertCSS({
        target: { tabId: tabId, allFrames: true },
        files: [
            "src/shared/assets/css/main.css"
        ]
    }).then(() => { console.log(`CSS Injected: ${tabId}`) })

    addMenuChrome(tab).then(async () => {
        console.log("Begin add menu")
    }).catch((error) => { 
        console.log(`Error occur at adding menu. Details: ${error}`) 
    })

})

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {

    if (message.lastSeenReportTaken){
        var userData = await chrome.identity.getProfileUserInfo()
        console.log(`User data: ${userData}`)
        
        let response = await fetch(
            `${config.BACKEND_API_URL}update-profile`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: userData.email
                })
            }
        )
        if (response.status != 200){
            return 
        }
        /*let updated = await response.json()
        console.log(`updated: ${updated}`)
        await chrome.cookies.set(
            {
                name: 'last_check',
                value: updated.last_cheek,
                url: 'https://www.youtube.com'
            }
        )*/
        chrome.runtime.reload()
    }

    if (message.config){
        sendResponse({
            config: config
        })
    }
})