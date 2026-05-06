import { getConfig } from '../../../shared/utils/utils.js'
import * as rs from '../ui/render-state.js'

async function getLastSeen(event){
    var username = document.querySelector('yt-content-metadata-view-model > div > span > span').textContent

    console.log(`USERNAME: ${username}`)

    const config = await getConfig()
    const painter = new rs.BuildStateCard(new rs.waitView())
    await painter.main(null)
    
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
        chrome.runtime.sendMessage({ lastSeenReportTaken: true })

    }).finally(
        () => painter.setState(new rs.errorView())
    ).catch(async (error) => await painter.main(error))
    
}

export { 
    getLastSeen
}