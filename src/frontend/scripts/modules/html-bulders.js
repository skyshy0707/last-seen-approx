async function innerHTML(path){
    let response = await fetch('chrome-extension://ennaeaolgbonmikpfeolphklfkgghnko/' + path)
    let text = await response.text()
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
    waitHTML
}