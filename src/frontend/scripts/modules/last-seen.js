import { config } from '../main/config.js'
import { addErrorText } from './error-handler.js'
import { lastSeenHTML, waitHTML } from './html-builders.js'
import * as rs from './render-state.js'

async function getLastSeen(event){
    var username = document.querySelector('yt-content-metadata-view-model > div > span > span').textContent

    console.log(`USERNAME: ${username}`)

    const painter = new rs.BuildStateCard(new rs.waitView())
    await painter.main(null)

    /*const lastSeenBtn = document.querySelector(".last-seen-align")
    const commonDiv = lastSeenBtn.parentNode
    const waitContainer = document.createElement("div")

    lastSeenBtn.remove()
    waitContainer.innerHTML = await waitHTML()
    //waitContainer.innerHTML = "<p>A</p>"
    commonDiv.appendChild(waitContainer)*/

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

        painter.setState(new rs.lastSeenView())
        await painter.main(data)



        /*const content = data.text_display || ''
        const publishedAt = data.published_at
        const type = data.type || 'comment'
        const urlPathId = data.video_id || data.channel_id
        const urlResourse = type == 'subscription' ? `https://www.youtube.com/channel/${urlPathId}` : `https://www.youtube.com/watch?v=${urlPathId}`

        const dataItems = [
            { text: 'Data Type: ', value: type },
            { text: 'Published At: ', value: publishedAt },
            { text: 'Resourse URL: ', value: urlResourse },
            { text: 'Content: ', value: content }
        ]

        const lastSeenDataContainer = document.createElement("div")
        lastSeenDataContainer.className = "last-seen-data-container"
        lastSeenDataContainer.innerHTML = await lastSeenHTML()
        const lastSeenData = lastSeenDataContainer.querySelector(".last-seen-text-container")

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
        chrome.runtime.sendMessage({ lastSeenReportTaken: true })*/
        chrome.runtime.sendMessage({ lastSeenReportTaken: true })

        /*.finally(
        () => waitContainer.remove()*/

    }).finally(
        () => painter.setState(new rs.errorView())
    ).catch(async (error) => await painter.main(error))
    
}

export { 
    getLastSeen,
    lastSeenHTML
}