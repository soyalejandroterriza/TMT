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


    // === NOMBRE DEL TÉCNICO ===

    // Cargar valor guardado
    chrome.storage.sync.get("nombreTecnico", ({ nombreTecnico }) => {
        document.getElementById("nombreTecnico").value = nombreTecnico || "de la red de flotas";
    });

    // Guardar cuando el usuario escribe
    document.getElementById("nombreTecnico").addEventListener("input", (e) => {
        chrome.storage.sync.set({ nombreTecnico: e.target.value.trim() });
    });

        // --- ACTIVAR ATAJO CORRECTOR MATRICULAS ---
    chrome.storage.sync.get("enableMatShortcut", ({ enableMatShortcut }) => {
        document.getElementById("enableMatShortcut").checked = enableMatShortcut ?? true;
    });

    document.getElementById("enableMatShortcut").addEventListener("change", (e) => {
        chrome.storage.sync.set({ enableMatShortcut: e.target.checked });
    });
});
