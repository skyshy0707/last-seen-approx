import styles from "../../assets/css/main.css.js"

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

async function insertCSS(){
    let config = await getConfig()
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `chrome-extension://${config.GOOGLE_EXTENSION_ID}/assets/css/main.css`
    document.head.append(link)
}


function insertCSS2(){
    const style = document.createElement('style')
    style.textContent = styles
    document.head.appendChild(style)
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

 

async function lastSeenHTML() {
    return await innerHTML('templates/last-seen-data.html')
}

async function errorHTML(){
    let text =  await innerHTML('templates/error-data.html')
    console.log(`text: ${text}`)
    return text
}

async function waitHTML(){
    return await innerHTML('templates/wait.html')
}

export {
    lastSeenHTML,
    errorHTML,
    waitHTML,
    insertCSS,
    insertCSS2,
    getConfig
}