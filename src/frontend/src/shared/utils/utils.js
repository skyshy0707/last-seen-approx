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

async function getConfig(){

    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            config: true
        }, (response) => {
            if (response){
                resolve(response.config)
            }
        })
    })
}

async function innerHTML(path){
    let config = await getConfig()
    let response = await fetch(`chrome-extension://${config.GOOGLE_EXTENSION_ID}/` + path)
    let text = await response.text()
    
    text = text.replace(/{{\s*([\w\_]+)\s*}}/g, (match, variableName) => {
        if (config[variableName] !== undefined){
            return config[variableName]
        }
        return match
    })
    return text
}

export {
    getCookie,
    getConfig, 
    innerHTML
}