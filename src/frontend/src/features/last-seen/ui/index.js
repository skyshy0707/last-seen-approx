async function importModule(path) {
    const src = await chrome.runtime.getURL(path)
    const module = await import(src)
    return module
}

async function addMenu(){

    const draft = await importModule("src/features/last-seen/lib/drafter.js")
    const ui = await importModule("src/features/last-seen/ui/last-seen-btn.js")
    const engine = new draft.DraftAfterMutattions(new ui.DraftLastSeen())
    const subscribe = await engine.findWrapper(
        (node) => console.log(`This node looks: ${node}`), 
        document, 
        "yt-flexible-actions-view-model",
        "#content",
        true
    )
    await engine.ui.draft(subscribe)
}

export { addMenu }