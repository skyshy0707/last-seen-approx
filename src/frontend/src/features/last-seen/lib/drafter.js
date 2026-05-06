
class DraftAfterMutattions{


    constructor(ui){
        this.ui = ui
    }

    async redraft(
        mutations, 
        observer, 
        targetSelectorName="yt-subscribe-button-view-model",
        affectedSelector="#content"
    ){
        for (let mutation of mutations){
            for (let node of mutation.addedNodes){

                if (!(node instanceof HTMLElement)) continue

                if (node.matches(targetSelectorName)){
                    return node
                }
                // Перерисовка после каждой мутации:
                if (node.matches(affectedSelector)){
                    console.log(`CONTENT founded: ${node} ${new Date()}`)

                    let drawHere = document.querySelector(targetSelectorName)
                    if (!drawHere){
                        drawHere = await this.findWrapper(
                            (targetNode) => {console.log(`FOUND TARGET NODE: ${targetNode}`)},
                            document,
                            targetSelectorName,
                            affectedSelector,
                            true
                        )
                    }
                    await this.ui.draft(drawHere)
                }
            }
        }
        return null
    }


    async findWrapper(
        cb, 
        node, 
        targetSelectorName="yt-subscribe-button-view-model", 
        affectedSelector="#content",
        stopWhenFound=false,

    ){
        /* Ищет html-узел, на котором будет 
        монтироваться интерфейс пользователя 
        и запускает монтаж интерфейса */

        const promise = new Promise((resolve, reject) => {
            new MutationObserver(
                async (mutations, observer) => {
                    try {
                        let wrapper = await this.redraft(
                            mutations, 
                            observer, 
                            targetSelectorName,
                            affectedSelector
                        )
                        cb(wrapper)
                        if (wrapper){
                            if (stopWhenFound){
                                observer.disconnect()
                            }
                            resolve(wrapper) 
                        }
                        wrapper = document.querySelector(targetSelectorName)
                        if (wrapper){
                            if (stopWhenFound){
                                observer.disconnect()
                            }
                            resolve(wrapper)
                        }
                    }
                    catch (error) {
                        console.log(`
                            Error occur while finding wrapper ${error.stack}, 
                            error attrs: ${Object.keys(error)}
                        `)
                        reject(error)
                    }
                }
            ).observe(
                node, 
                { 
                    attributes: true, 
                    childList: true, 
                    subtree: true, 
                    characterData: true 
                }
            )
        })
        return await Promise.resolve(promise)
    }  
}

export { DraftAfterMutattions }