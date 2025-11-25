

chrome.runtime.onMessage.addListener((msg) => {    if (msg.action === "toggleBarra") {
        toggleBarra();
    }
});

// Detectar automáticamente si estamos en una orden NG
(function autoOpenBar() {
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
})();



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

// Crear botón genérico (para GET DATA, CLEAN, HIDE, etc)
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
        "btn_obs",
        "btn_whatsapp"
    ];

    ids.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            const short = btn.textContent.split(":")[0]; // OR, ES, MAT, etc.
            btn.textContent = `${short}: NULO`;

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

    render_whatsapp_button(contact_phone);

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

    btn.textContent = value ? `OR: ${value}` : "OR: NULO";
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

    btn.textContent = value ? `Estado: ${value}` : "Estado: NULO";
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

    btn.textContent = value ? `Matricula: ${value}` : "Matricula: NULO";
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

    btn.textContent = value ? `Kilómetros: ${value}` : "Kilómetros: NULO";
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

    btn.textContent = value ? `Usuario: ${value}` : "Usuario: NULO";
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

    btn.textContent = value ? `TEL: ${value}` : "TEL: NULO";
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

    btn.textContent = zip ? `CP: ${zip}` : "CP: NULO";
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

    btn.textContent = name ? `Taller: ${name}` : "Taller: NULO";
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

    btn.textContent = "Generar observaciones";
    btn.disabled = !value;

    applyDataButtonStyle(btn, !!value);
}
function render_whatsapp_button(phone) {
    let btn = document.getElementById("btn_whatsapp");

    if (!btn) {
        btn = document.createElement("button");
        btn.id = "btn_whatsapp";

        btn.addEventListener("click", () => {
            if (phone) {
                // Limpiar teléfono: quitar espacios, guiones, paréntesis, etc.
                const cleanPhone = phone.replace(/\D/g, "");

                // Abrir en nueva pestaña
                window.open(`https://wa.me/34${cleanPhone}`, "_blank");
            }
        });

        const container = ensureInnerContainer();
        container.appendChild(btn);
    }

    btn.textContent = "Enviar WhatsApp al cliente";
    btn.disabled = !phone;

    applyDataButtonStyle(btn, !!phone);
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

    btn.textContent = value ? `Cita: ${value}` : "Cita: NULO";
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

    if (!document.getElementById("btn_clean")) {
        const btnClean = createSimpleButton("LIMPIAR", clean_data);
        btnClean.id = "btn_clean";
        container.appendChild(btnClean);
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

    // Botón INFO
    if (!document.getElementById("btn_info")) {
        const btnInfo = createSimpleButton("INFO", () => {
            alert(
                "NG CPT\n\n" +
                "22/11/2025\n\n" +
                "Versión: 1.0\n"
            );
        });
        btnInfo.id = "btn_info";
        infoContainer.appendChild(btnInfo);
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



