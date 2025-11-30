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
    // === NOMBRE DEL TÉCNICO ===
    //
    chrome.storage.sync.get("technicianName", ({ technicianName }) => {

        // Valor por defecto
        if (!technicianName) {
            technicianName = "TECNICO";
            chrome.storage.sync.set({ technicianName });
        }

        document.getElementById("technicianName").value = technicianName;
    });

    // Guardar cuando escribe
    document.getElementById("technicianName").addEventListener("input", (e) => {
        chrome.storage.sync.set({ technicianName: e.target.value.trim() });
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

});
