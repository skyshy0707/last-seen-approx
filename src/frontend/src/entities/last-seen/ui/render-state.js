import * as build from  "./html-builders.js"


class viewData{

    dataText = "strong"
    mainContainerClass = "last-seen-data-container"
    commonDiv = "yt-flexible-actions-view-model"
}

class view extends viewData{

    html(){
        throw Error("Method must be implemented")
    }

    extractData(){
        throw Error("Method must be implemented")
    }

    paintContent(){
        throw Error("Method must be implemented")
    }
}

class errorView extends view{

    async html(){
        return await build.errorHTML()
    }

    extractData(data){

        let textErrors = {
            default: "Ой, ошибка. Роботы добрались до нас и устроили рок-концерт. Ждите, мы всё исправим."
        }

        return data.message || textErrors.default
    }

    paintContent(data, mainContainer){
        let errorMessage = this.extractData(data)

        const dataText = document.createElement(this.dataText)
        const commonDiv =  document.querySelector(this.commonDiv)
        const lastSeenBtn = document.querySelector(".last-seen-align")
        const lastSeenData = mainContainer.querySelector(".last-seen-text-container")

        dataText.innerText = errorMessage
        lastSeenBtn ? lastSeenBtn.remove() : console.log("Button \'last-seen\' was removed")
        lastSeenData.appendChild(dataText)
        commonDiv.appendChild(mainContainer)
    }
}

class lastSeenView extends view{

    async html(){
        return await build.lastSeenHTML()
    }

    extractData(data){

        const content = data.text_display || ''
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

        return dataItems
    }

    paintContainer(data, mainContainer){
        const commonDiv =  document.querySelector(this.commonDiv)
        const lastSeenData = mainContainer.querySelector(".last-seen-text-container")
        let dataItems = this.extractData(data)

        for (let dataItem of dataItems){
            var dataItemDiv = document.createElement("div")
            var dataText = document.createElement(this.dataText)
            var textValue = document.createTextNode(dataItem.value)

            dataItemDiv.className = "last-seen-data-item"
            dataText.innerText = dataItem.text
            dataItemDiv.appendChild(dataText)
            dataItemDiv.appendChild(textValue)
            lastSeenData.appendChild(dataItemDiv)
        }
        commonDiv.appendChild(lastSeenDataContainer)
        
    }
}

class waitView extends view{

    async html(){
        return await build.waitHTML()
    }

    extractData(){
        return null
    }

    paintContent(data, mainContainer){
        const lastSeenBtn = document.querySelector(".last-seen-align")
        const commonDiv = document.querySelector(this.commonDiv)
        lastSeenBtn.remove()
        commonDiv.appendChild(mainContainer)
    }
}



class BuildStateCard extends viewData{
  

    constructor(state){
        super()
        this.state = state
    }

    setState(state){
        this.state = state
    }

    async createMainContainer(){
        let lastSeenDataContainer = document.querySelector(`.${this.mainContainerClass}`)
        if (!lastSeenDataContainer){
            lastSeenDataContainer = document.createElement("div")
            lastSeenDataContainer.className = this.mainContainerClass
        }
        lastSeenDataContainer.innerHTML = await this.state.html()
        return lastSeenDataContainer
    }

    async main(data){
        const lastSeenDataContainer = await this.createMainContainer()
        this.state.paintContent(data, lastSeenDataContainer)
    }
}

let errorHandler = new BuildStateCard(new errorView)

export {
    errorView,
    lastSeenView,
    waitView,
    BuildStateCard,
    errorHandler
}