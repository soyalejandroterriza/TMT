// Funciones de comprobación de dominio
function isNorthgateDomain() {
    const host = window.location.hostname;
    return host === "nthp.northgateplc.es" || host.endsWith(".northgateplc.es");
}

function isOtherDomain() {
    const host = window.location.hostname;
    return host === "nextfleet.servicenext.eu" || 
           host.endsWith(".nextfleet.servicenext.eu") ||
           host === "localhost" || 
           host === "127.0.0.1";
}

// Inicialización al cargar la página
(function main() {
    if (isNorthgateDomain()) {
        if (window.NGCPTBar) {
            window.NGCPTBar.init();
        }
    } else if (isOtherDomain()) {
        if (window.NextfleetBar) {
            window.NextfleetBar.init();
        }
    }
})();

// Delegador de mensajes del Background (comandos/atajos)
chrome.runtime.onMessage.addListener((msg) => {
    if (isNorthgateDomain() && window.NGCPTBar) {
        if (msg.action === "toggleBarra") {
            window.NGCPTBar.toggle();
        } else if (msg.action === "fixMatriculaCommand") {
            window.NGCPTBar.fixMatricula();
        }
    } else if (isOtherDomain() && window.NextfleetBar) {
        if (msg.action === "toggleBarra") {
            window.NextfleetBar.toggle();
        }
        // Agrega atajos específicos para la otra barra si fuesen necesarios
    }
});
