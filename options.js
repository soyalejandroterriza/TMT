document.addEventListener("DOMContentLoaded", () => {

    //
    // === AUTO-OPEN ===
    //

    chrome.storage.sync.get("autoOpenBar", ({ autoOpenBar }) => {

        // Si nunca ha sido configurado → por defecto TRUE
        if (autoOpenBar === undefined) {
            autoOpenBar = true;
            chrome.storage.sync.set({ autoOpenBar: true });
        }

        document.getElementById("autoOpen").checked = autoOpenBar;
    });

    document.getElementById("autoOpen").addEventListener("change", (e) => {
        chrome.storage.sync.set({ autoOpenBar: e.target.checked });
    });



    // === POSICIÓN DE BARRA ===


    chrome.storage.sync.get("barraPos", ({ barraPos }) => {
        document.getElementById("barraPos").value = barraPos || "right";
    });

    document.getElementById("barraPos").addEventListener("change", (e) => {
        chrome.storage.sync.set({ barraPos: e.target.value });
    });

});
