// Atajo de teclado
chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-barra") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "toggleBarra" });
        });
    }
});

// Escucha globalmente los atajos listados en manifest.json y evita errores si la pestaña no admite content scripts
chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

        chrome.tabs.sendMessage(tabs[0].id, { action: command })
            .catch(() => {
                // No pasa nada: la pestaña no admite content scripts.
            });
    });
});

// Clic en el icono de la extensión
chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, { action: "toggleBarra" });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "openOptions") {
        chrome.runtime.openOptionsPage();
    }
});

chrome.commands.onCommand.addListener(async (command) => { // Listener global del atajo corrector de matrículas.
    if (command !== "fix-matricula") return;

    // Ver si el usuario tiene activado el corrector
    const { enableMatShortcut } = await chrome.storage.sync.get("enableMatShortcut");
    if (enableMatShortcut === false) return;

    // Obtener pestaña activa
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) return;

        chrome.tabs.sendMessage(tabs[0].id, { action: "fixMatriculaCommand" });
    });
});

