async function importModule(path) {
    const src = await chrome.runtime.getURL(path)
    const module = await import(src)
    return module
}

async function main() {
    const imported = await importModule("src/features/last-seen/ui/index.js")
    await imported.addMenu()
}

main()
    .then(
        () => console.log("Menu is drafted")
    )
    .catch(
        (error) => {
            console.log(`
                Error occur at adding the menu. 
                Details: ${error} ${error.stack}, 
                error attrs: ${Object.keys(error)}
            `)
        }
    )