window.NGCPTBar = (function() {


    // Detectar automáticamente si estamos en una orden NG
    function init() {
        const url = window.location.href;

        if (url.includes("/orden.html?id=")) {

            chrome.storage.sync.get("autoOpenBar", ({ autoOpenBar }) => {

                if (autoOpenBar === undefined) {
                    autoOpenBar = true;
                    chrome.storage.sync.set({ autoOpenBar: true });
                }

                if (autoOpenBar) {
                    toggleBarra();
                }
            });
        }
    }

// Corrige una matrícula a nivel interno (pasa "ABC1234" → "1234ABC")
function fixMatricula(raw) {
    // Eliminar TODOS los caracteres invisibles, espacios, tabs, newlines, etc.
    // y convertir a mayúsculas
    raw = raw.toUpperCase()
        .replace(/\s/g, "")           // espacios normales
        .replace(/[\u200B-\u200D\uFEFF]/g, "")  // espacios de ancho cero y otros invisibles Unicode
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, ""); // caracteres de control
    
    // Extraer solo letras y números
    const letras = raw.replace(/\d/g, "");
    const numeros = raw.replace(/\D/g, "");
    
    // Asegurarse de que no queden espacios al inicio/final
    return (numeros + letras).trim();
}

// Aplica la corrección al texto seleccionado dentro de un input/textarea
function fixSelectedMatricula() {
    const active = document.activeElement;

    if (!active) return;
    if (!(active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;
    if (typeof active.selectionStart !== "number") return;

    const selStart = active.selectionStart;
    const selEnd = active.selectionEnd;

    if (selStart === selEnd) return; // no hay selección

    const selected = active.value.substring(selStart, selEnd);
    const fixed = fixMatricula(selected);

    // Construir el nuevo valor sin caracteres invisibles
    const newValue = 
        active.value.substring(0, selStart) +
        fixed +
        active.value.substring(selEnd);

    // Usar setRangeText para una inserción más limpia (si está disponible)
    // o asignar directamente el valor
    if (active.setRangeText) {
        active.setRangeText(fixed, selStart, selEnd, "end");
        // Disparar evento input para que el campo se actualice correctamente
        active.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        active.value = newValue;
        // colocar el cursor justo después del texto corregido
        const newPos = selStart + fixed.length;
        active.selectionStart = active.selectionEnd = newPos;
    }
}




// Posición de la barra
function toggleBarPosition() {
    const barra = document.getElementById("mi-barra-superior");
    if (!barra) return;

    chrome.storage.sync.get("barraPos", ({ barraPos }) => {
        let newPos = barraPos === "left" ? "right" : "left";

        // Aplicar nueva posición visual
        applyBarPosition(barra, newPos);

        // Guardar en chrome.storage
        chrome.storage.sync.set({ barraPos: newPos });
    });
}
function applyBarPosition(barra, pos) {
    if (pos === "left") {
        barra.style.left = "0";
        barra.style.right = "";
    } else {
        barra.style.right = "0";
        barra.style.left = "";
    }
}


//Habilitar y deshabilitar barra con comando
function toggleBarra() {
    let barra = document.getElementById("mi-barra-superior");

    if (!barra) {

        barra = document.createElement("div");
        barra.id = "mi-barra-superior";

        Object.assign(barra.style, {
            position: "fixed",
            top: "0",
            width: "280px",
            height: "100vh",
            backgroundColor: "#1a1a1a",
            color: "white",
            fontSize: "14px",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            padding: "12px",
            gap: "12px",
            zIndex: "999999999",
            borderLeft: "2px solid #333",
            boxShadow: "-2px 0px 5px rgba(0,0,0,0.4)",
            overflowY: "auto"
        });

        document.documentElement.appendChild(barra);

        // ⬇️ PRIMERO aplicar posición
        chrome.storage.sync.get("barraPos", ({ barraPos }) => {
            if (!barraPos) barraPos = "right";
            applyBarPosition(barra, barraPos);

            // ⬇️ DESPUÉS crear botones
            ensureUtilityButtons();

            // ⬇️ Y FINALMENTE, lanzar GET automáticamente
            //get_data(); No lo lanzamos automáticmaente para prevenir que la barra se cree y se rellene de manera automática con campos faltantes. NG no sirve todos los datos de manera simultánea.
        });

    } else {
        const wasHidden = (barra.style.display === "none");

        barra.style.display = wasHidden ? "flex" : "none";

        if (wasHidden) {
            clean_data();
            get_data(); // ⬅️ mostrar → refrescar datos automáticamente
        }
    }
}



//Función para ocultar la barra.
function hide_barra() {
    const barra = document.getElementById("mi-barra-superior");
    if (barra) {
        barra.style.display = "none";
    }
}

// Crear o devolver el contenedor interno donde van los botones
function ensureInnerContainer() {
    let container = document.getElementById("mi-barra-superior-inner");

    if (!container) {
        container = document.createElement("div");
        container.id = "mi-barra-superior-inner";

    Object.assign(container.style, {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        paddingTop: "5px"
});

        const barra = document.getElementById("mi-barra-superior");
        barra.appendChild(container);
    }

    return container;
}

// Función para crear botón genérico
function createSimpleButton(text, onClick) {
    const btn = document.createElement("button");

    btn.textContent = text;

    // Estilo para botones especiales (HIDE, GET DATA, CLEAN)
    Object.assign(btn.style, {
        width: "100%",
        padding: "10px 12px",
        textAlign: "left",
        background: "#27A844",     // ✔ verde solicitado
        color: "white",
        fontWeight: "bold",        // ✔ texto en negrita
        border: "1px solid #1e7d35",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "15px",
        transition: "background 0.15s ease"
    });

    // Hover
    btn.addEventListener("mouseover", () => {
        btn.style.background = "#32c254";   // un tono más claro
    });

    btn.addEventListener("mouseout", () => {
        btn.style.background = "#27A844";
    });

    btn.addEventListener("click", onClick);

    return btn;
}



// Función para limpiar todos los datos atrapados.
function clean_data() {
    // Restaurar botón TOMAR DATOS
    const btnGet = document.getElementById("btn_get_data");
    if (btnGet) btnGet.style.display = "block";


    const ids = [
        "btn_order_id",
        "btn_state",
        "btn_matricula",
        "btn_km",
        "btn_contact_name",
        "btn_contact_phone",
        "btn_shop_zip",
        "btn_shop_name",
        "btn_obs"
    ];

    ids.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            const short = btn.textContent.split(":")[0]; // OR, ES, MAT, etc.
            btn.innerHTML = `<b>${short}:</b> NULO`;

            btn.disabled = true;

            // APLICAR ESTILO DESHABILITADO
            applyDataButtonStyle(btn, false);
        }
    });
}


// Función raiz para GET_DATA
function get_data() {
    // Ocultar botón TOMAR DATOS después de usarlo
    const btnGet = document.getElementById("btn_get_data");
    if (btnGet) btnGet.style.display = "none";


    const order_id = get_order_id();
    render_order_id(order_id);

    const matricula = get_matricula();
    render_matricula(matricula);

    const state = get_state();
    render_state(state);

    const km = get_kilometros();
    render_kilometros(km);

    render_separator();

    const contact_name = get_contact_name();
    render_contact_name(contact_name);

    const contact_phone = get_contact_phone();
    render_contact_phone(contact_phone);

    render_separator();

    const shop = get_shop_info();
    render_shop_name(shop.name);
    render_shop_zip(shop.zip);

    const cita = get_cita();
    render_cita(cita);

    
    render_separator();

    const obs = get_obs();
    render_obs(obs);
}



// Funciones RENDER
function render_order_id(value) { //Número de orden Northgate
    let btn = document.getElementById("btn_order_id");

    if (!btn) {
        btn = document.createElement("button");
        btn.id = "btn_order_id";

        btn.addEventListener("click", () => {
            if (value) navigator.clipboard.writeText(value);
        });

        const container = ensureInnerContainer();
        container.appendChild(btn);
    }

    btn.innerHTML = value ? `<b>OR:</b> ${value}` : "<b>OR:</b> NULO";
    btn.disabled = !value;

    applyDataButtonStyle(btn, !!value);
}
function render_state(value) { //Estado de la orden
    let btn = document.getElementById("btn_state");

    if (!btn) {
        btn = document.createElement("button");
        btn.id = "btn_state";

        btn.addEventListener("click", () => {
            if (value) navigator.clipboard.writeText(value);
        });

        const container = ensureInnerContainer();
        container.appendChild(btn);
    }

    btn.innerHTML = value ? `<b>Estado:</b> ${value}` : "<b>Estado:</b> NULO";
    btn.disabled = !value;

    applyDataButtonStyle(btn, !!value);
}
function render_matricula(value) { //Matrícula
    let btn = document.getElementById("btn_matricula");

    if (!btn) {
        btn = document.createElement("button");
        btn.id = "btn_matricula";

        btn.addEventListener("click", () => {
            if (value) navigator.clipboard.writeText(value);
        });

        const container = ensureInnerContainer();
        container.appendChild(btn);
    }

    btn.innerHTML = value ? `<b>Matricula:</b> ${value}` : "<b>Matricula:</b> NULO";
    btn.disabled = !value;

    applyDataButtonStyle(btn, !!value);
}
function render_kilometros(value) { //Kilómetros
    let btn = document.getElementById("btn_km");

    if (!btn) {
        btn = document.createElement("button");
        btn.id = "btn_km";

        btn.addEventListener("click", () => {
            if (value) navigator.clipboard.writeText(value);
        });

        const container = ensureInnerContainer();
        container.appendChild(btn);
    }

    btn.innerHTML = value ? `<b>Kilómetros:</b> ${value}` : "<b>Kilómetros:</b> NULO";
    btn.disabled = !value;

    applyDataButtonStyle(btn, !!value);
}
function render_contact_name(value) { //Nombre del usuario
    let btn = document.getElementById("btn_contact_name");

    if (!btn) {
        btn = document.createElement("button");
        btn.id = "btn_contact_name";

        btn.addEventListener("click", () => {
            if (value) navigator.clipboard.writeText(value);
        });

        const container = ensureInnerContainer();
        container.appendChild(btn);
    }

    btn.innerHTML = value ? `<b>Usuario:</b> ${value}` : "<b>Usuario:</b> NULO";
    btn.disabled = !value;

    applyDataButtonStyle(btn, !!value);
}
function render_contact_phone(value) { //Teléfono del usuario
    let btn = document.getElementById("btn_contact_phone");

    if (!btn) {
        btn = document.createElement("button");
        btn.id = "btn_contact_phone";

        btn.addEventListener("click", () => {
            if (value) navigator.clipboard.writeText(value);
        });

        const container = ensureInnerContainer();
        container.appendChild(btn);
    }

    btn.innerHTML = value ? `<b>TEL:</b> ${value}` : "<b>TEL:</b> NULO";
    btn.disabled = !value;

    applyDataButtonStyle(btn, !!value);
}
function render_shop_zip(zip) { //CP Taller
    let btn = document.getElementById("btn_shop_zip");

    if (!btn) {
        btn = document.createElement("button");
        btn.id = "btn_shop_zip";

        btn.addEventListener("click", () => {
            if (zip) navigator.clipboard.writeText(zip);
        });

        const container = ensureInnerContainer();
        container.appendChild(btn);
    }

    btn.innerHTML = zip ? `<b>CP:</b> ${zip}` : "<b>CP:</b> NULO";
    btn.disabled = !zip;

    applyDataButtonStyle(btn, !!zip);
}
function render_shop_name(name) { //Nombre del taller
    let btn = document.getElementById("btn_shop_name");

    if (!btn) {
        btn = document.createElement("button");
        btn.id = "btn_shop_name";

        btn.addEventListener("click", () => {
            if (name) navigator.clipboard.writeText(name);
        });

        const container = ensureInnerContainer();
        container.appendChild(btn);
    }

    btn.innerHTML = name ? `<b>Dirección del taller:</b> ${name}` : "<b>Dirección del taller:</b> NULO";
    btn.disabled = !name;

    applyDataButtonStyle(btn, !!name);
}
function render_obs(value) { //Observaciones completas
    let btn = document.getElementById("btn_obs");

    if (!btn) {
        btn = document.createElement("button");
        btn.id = "btn_obs";

        btn.addEventListener("click", () => {

            // Tomar todos los valores necesarios
            const OR = get_order_id();
            const MAT = get_matricula();        // matrícula invertida
            const USER = get_contact_name();
            const TEL = get_contact_phone();
            const OBS = get_obs();              // observaciones del HTML

            // Formato final EXACTO como lo pediste
            const finalText =
`Orden ${OR}  -  Matrícula ${MAT}
Usuario ${USER}  - Teléfono ${TEL}
Observaciones: ${OBS}




`;

            // Copiar a portapapeles
            navigator.clipboard.writeText(finalText);
        });

        const container = ensureInnerContainer();
        container.appendChild(btn);
    }

    btn.innerHTML = "<b>Generar observaciones</b>";
    btn.disabled = !value;

    applyDataButtonStyle(btn, !!value);
}



function render_separator(id = "") {

    const separatorId = id || ("sep_" + Math.random().toString(36).substr(2, 5));

    let sep = document.getElementById(separatorId);

    if (!sep) {
        sep = document.createElement("div");
        sep.id = separatorId;

        Object.assign(sep.style, {
            width: "100%",
            padding: "4px 10px",       // mismo tamaño que un botón
            height: "16px",            // fuerza altura consistente
            background: "transparent", // ✔ 100% invisible
            border: "none",            // ✔ sin borde
            marginTop: "2px",
            marginBottom: "2px",
            pointerEvents: "none",     // NO clicable
        });

        const container = ensureInnerContainer();
        container.appendChild(sep);
    }

    sep.textContent = ""; // ✔ vacío/invisible
}
function render_cita(value) { // Cita de taller
    let btn = document.getElementById("btn_cita");

    if (!btn) {
        btn = document.createElement("button");
        btn.id = "btn_cita";

        btn.addEventListener("click", () => {
            if (value) navigator.clipboard.writeText(value);
        });

        const container = ensureInnerContainer();
        container.appendChild(btn);
    }

    btn.innerHTML = value ? `<b>Cita:</b> ${value}` : "<b>Cita:</b> NULO";
    btn.disabled = !value;

    applyDataButtonStyle(btn, !!value);
}










// Funciones independientes de atrapar datos
function get_order_id() { //Número de orden Northgate
    const el = document.querySelector(".numParte");
    return el ? el.textContent.trim() : "";
}
function get_state() {  //Estado de la orden
    const el = document.getElementById("estPptoCab");
    return el ? el.textContent.trim() : "";
}
function get_matricula() { // Matricula
    const el = document.getElementById("matricula");
    if (!el) return "";

    const raw = el.value.trim().toUpperCase();

    let letras = "";
    let numeros = "";

    for (const char of raw) {
        if (/[A-Z]/.test(char)) letras += char;
        else if (/\d/.test(char)) numeros += char;
    }

    return numeros + letras;
}
function get_kilometros() { 
    const el = document.getElementById("kilometros");
    if (!el) return "";

    // Tomar el valor original del input
    let raw = el.value.trim();

    // Eliminar TODO excepto números
    raw = raw.replace(/\D/g, "");

    return raw;
}
function get_contact_name() { //Nombre de contacto
    const el = document.getElementById("nombre_contacto");
    return el ? el.value.trim() : "";
}
function get_contact_phone() { //Telefono del usuario
    const el = document.getElementById("telefono");
    return el ? el.value.trim() : "";
}
function get_shop_info() { //CP y nombre del taller
    const el = document.getElementById("direccion_taller");
    if (!el) return { zip: "", name: "" };

    const text = el.value ? el.value.trim() : el.textContent.trim(); // por si es input o span

    // ZIP = primeros 5 dígitos
    const zipMatch = text.match(/^\d{5}/);
    const zip = zipMatch ? zipMatch[0] : "";

    // NAME = resto del texto, quitando "XXXXX "
    const name = zip ? text.substring(6).trim() : text;

    return { zip, name };
}
function get_obs() { //Observaciones
    const el = document.getElementById("obs_taller");
    if (!el) return "";

    // Puede ser <textarea> o <input> o <div>
    if ("value" in el) return el.value.trim();
    return el.textContent.trim();
}
function get_cita() { // Cita previa
    const el = document.getElementById("cita_previa_content");
    if (!el) return "";

    const raw = el.value ? el.value.trim() : el.textContent.trim();

    // El formato es "26/11/2025 13:08"
    // Nos quedamos SOLO con la fecha (primer bloque antes del espacio)
    const date = raw.split(" ")[0];

    return date;
}



// Estilo estandarizado para botones de datos
function applyDataButtonStyle(btn, enabled) {

    // Fondo según estado
    const bg = enabled ? "#2a2a2a" : "#1a1a1a";

    Object.assign(btn.style, {
        width: "100%",
        padding: "8px 10px",
        textAlign: "left",
        background: bg,                     // ✔ fondo dinámico
        color: "white",
        border: "1px solid #444",
        borderRadius: "4px",
        cursor: enabled ? "pointer" : "default",
        fontSize: "14px",
        opacity: enabled ? "1" : "0.6",     // ✔ más oscuro al deshabilitar
        pointerEvents: enabled ? "auto" : "none", // ✔ bloquea clicks
        transition: "background 0.15s ease"
    });

    // Eliminar cualquier hover previo
    btn.onmouseover = null;
    btn.onmouseout = null;

    // Solo aplicar hover si está habilitado
    if (enabled) {
        btn.addEventListener("mouseover", () => {
            btn.style.background = "#3a3a3a";  // hover más claro
        });
        btn.addEventListener("mouseout", () => {
            btn.style.background = "#2a2a2a";  // estado normal
        });
    }
}


// Insertar botones GET DATA y CLEAN al cargar la barra
function ensureUtilityButtons() {
    const container = ensureInnerContainer();

    if (!document.getElementById("btn_hide")) {
        const btnHide = createSimpleButton("OCULTAR", hide_barra);
        btnHide.id = "btn_hide";
        container.appendChild(btnHide);
    }

    if (!document.getElementById("btn_get_data")) {
        const btnGet = createSimpleButton("TOMAR DATOS", get_data);
        btnGet.id = "btn_get_data";
        container.appendChild(btnGet);
    }

    //INFO BUTTON SIEMPRE ABAJO
    ensureInfoButton();
}
function ensureInfoButton() {

    let infoContainer = document.getElementById("info_container");

    if (!infoContainer) {
        infoContainer = document.createElement("div");
        infoContainer.id = "info_container";

        Object.assign(infoContainer.style, {
            marginTop: "auto",
            width: "100%",
            paddingTop: "12px"
        });

        const barra = document.getElementById("mi-barra-superior");
        barra.appendChild(infoContainer);
    }



    // Botón MOVER BARRA
    if (!document.getElementById("btn_move_bar")) {
        const btnMove = createSimpleButton("MOVER BARRA", toggleBarPosition);
        btnMove.id = "btn_move_bar";
        infoContainer.appendChild(btnMove);
    }

    // Botón CONFIGURACIÓN
    if (!document.getElementById("btn_options")) {
        const btnOptions = createSimpleButton("CONFIGURACIÓN", () => {
            chrome.runtime.sendMessage({ action: "openOptions" });
        });

        btnOptions.id = "btn_options";
        infoContainer.appendChild(btnOptions);
    }
}

    return {
        init: init,
        toggle: toggleBarra,
        fixMatricula: fixSelectedMatricula
    };
})();



