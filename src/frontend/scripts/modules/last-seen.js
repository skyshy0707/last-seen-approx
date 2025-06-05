import { config } from '../main/config.js'
import { addErrorText } from './error-handler.js'
import { lastSeenHTML, waitHTML } from './html-bulders.js'

async function getLastSeen(event){
    var username = document.querySelector('yt-content-metadata-view-model > div > span > span').textContent

    console.log(`USERNAME: ${username}`)
    const lastSeenBtn = document.querySelector(".last-seen-align")
    const commonDiv = lastSeenBtn.parentNode
    const waitContainer = document.createElement("div", { id: "wait" })

    lastSeenBtn.remove()
    waitContainer.innerHTML = await waitHTML()
    commonDiv.appendChild(waitContainer)

    fetch(
        `${config.BACKEND_API_URL}last-seen/?` + new URLSearchParams({
            username: username
        }).toString(), 
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    ).then(async (response) => {

        const data = await response.json()
        const content = data.text_display || ''
        const publishedAt = data.published_at
        const type = data.type || 'comment'
        const videoId = data.video_id
        const urlPathId = videoId || data.channel_id
        const urlResourse = type == 'subscription' ? `https://www.youtube.com/channel/${urlPathId}` : `https://www.youtube.com/watch?v=${urlPathId}`
        
        const lastSeenDataContainer = document.createElement("div")
        lastSeenDataContainer.className = "last-seen-data-container"
        lastSeenDataContainer.innerHTML = await lastSeenHTML()
        const lastSeenData = lastSeenDataContainer.querySelector(".last-seen-text-container")
        lastSeenData.style.color = "black"

        const dataItems = [
            { text: 'Data Type: ', value: type },
            { text: 'Published At: ', value: publishedAt },
            { text: 'Resourse URL: ', value: urlResourse },
            { text: 'Content: ', value: content }
        ]

        for (let dataItem of dataItems){

            var dataItemDiv = document.createElement("div")
            var divText = document.createElement("strong")
            var textValue = document.createTextNode(dataItem.value)

            dataItemDiv.className = "last-seen-data-item"
            divText.innerText = dataItem.text
            dataItemDiv.appendChild(divText)
            dataItemDiv.appendChild(textValue)
            lastSeenData.appendChild(dataItemDiv)
        }
        commonDiv.appendChild(lastSeenDataContainer)
        chrome.runtime.sendMessage({ lastSeenReportTaken: true })


    }).finally(
        () => {waitContainer.remove()}
    ).catch((error) => addErrorText(error))
    
}

export { 
    getLastSeen,
    lastSeenHTML
}