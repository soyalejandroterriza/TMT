// Atajo de teclado
chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-barra") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "toggleBarra" });
        });
    }
});

// Clic en el icono de la extensión
chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, { action: "toggleBarra" });
});
