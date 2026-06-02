document.addEventListener("DOMContentLoaded", () => {

    //
    // === AUTO-OPEN ===
    //
    chrome.storage.sync.get("autoOpenBar", ({ autoOpenBar }) => {
        if (autoOpenBar === undefined) {
            autoOpenBar = true;
            chrome.storage.sync.set({ autoOpenBar: true });
        }
        document.getElementById("autoOpen").checked = autoOpenBar;
    });

    document.getElementById("autoOpen").addEventListener("change", (e) => {
        chrome.storage.sync.set({ autoOpenBar: e.target.checked });
    });



    //
    // === POSICIÓN DE BARRA ===
    //
    chrome.storage.sync.get("barraPos", ({ barraPos }) => {
        document.getElementById("barraPos").value = barraPos || "right";
    });

    document.getElementById("barraPos").addEventListener("change", (e) => {
        chrome.storage.sync.set({ barraPos: e.target.value });
    });







    //
    // === ACTIVAR ATAJO CORRECTOR MATRÍCULAS ===
    //
    chrome.storage.sync.get("enableMatShortcut", ({ enableMatShortcut }) => {
        document.getElementById("enableMatShortcut").checked = enableMatShortcut ?? true;
    });

    document.getElementById("enableMatShortcut").addEventListener("change", (e) => {
        chrome.storage.sync.set({ enableMatShortcut: e.target.checked });
    });
    //
    // === AUTO-OPEN NFBAR ===
    //
    chrome.storage.sync.get("autoOpenNFBar", ({ autoOpenNFBar }) => {
        if (autoOpenNFBar === undefined) {
            autoOpenNFBar = true;
            chrome.storage.sync.set({ autoOpenNFBar: true });
        }
        document.getElementById("autoOpenNFBar").checked = autoOpenNFBar;
    });

    document.getElementById("autoOpenNFBar").addEventListener("change", (e) => {
        chrome.storage.sync.set({ autoOpenNFBar: e.target.checked });
    });

});
