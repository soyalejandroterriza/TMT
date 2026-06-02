window.NextfleetBar = (function() {
    let barra = null;
    let toastContainer = null;

    function init() {
        console.log("TMT - NextFleet: Módulo cargado.");

        // Escuchar clics en el documento para detectar acciones de adjuntar archivos
        document.addEventListener("click", (e) => {
            const target = e.target;
            if (!target) return;

            // Encontrar el contenedor interactivo más cercano
            const clickable = target.closest("button, a, [role='button'], .btn, .button") || target;
            const stripAccents = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const text = stripAccents(clickable.textContent.trim().toLowerCase());

            // Imprimir traza de depuración en consola para que el usuario/desarrollador pueda ver qué cazo el script
            console.log("NG CPT Clic detectado en:", clickable.tagName, "| Texto:", text);

            // Coincidencia estricta: debe contener "nuevo" y además ("fichero", "adjunto" o "archivo")
            const coincideTexto = text.includes("nuevo") && 
                                  (text.includes("fichero") || text.includes("adjunto") || text.includes("archivo"));

            if (text.length < 60 && coincideTexto) {
                console.log("NG CPT: Coincidencia de nuevo adjunto detectada. Abriendo barra.");
                
                // Retraso de 350ms para dar tiempo a NextFleet a renderizar la ventana/formulario en el DOM
                setTimeout(() => {
                    if (!barra || barra.style.display === "none") {
                        toggleBarra();
                    }
                }, 350);
            }
        }, true);
    }

    function toggleBarra() {
        if (!barra) {
            crearBarra();
        } else {
            const isHidden = barra.style.display === "none";
            barra.style.display = isHidden ? "flex" : "none";
            if (isHidden) {
                mostrarToast("Barra rápida mostrada");
            }
        }
    }

    function crearBarra() {
        // Crear elemento principal de la barra
        barra = document.createElement("div");
        barra.id = "ng-cpt-barra-horizontal";
        
        // Estilos CSS modernos con Glassmorphism y diseño premium
        Object.assign(barra.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            backgroundColor: "rgba(18, 18, 18, 0.82)",
            backdropFilter: "blur(15px)",
            webkitBackdropFilter: "blur(15px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.4)",
            zIndex: "999999999",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 24px",
            boxSizing: "border-box",
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
            transition: "all 0.3s ease"
        });

        // Contenedor e Identidad visual de la barra (Logo / Etiqueta)
        const brandContainer = document.createElement("div");
        Object.assign(brandContainer.style, {
            display: "flex",
            alignItems: "center",
            gap: "10px"
        });

        const logo = document.createElement("div");
        logo.textContent = "⚡";
        Object.assign(logo.style, {
            fontSize: "18px",
            animation: "pulse 2s infinite alternate"
        });

        const brandText = document.createElement("span");
        brandText.textContent = "TMT - Terriza 2026";
        Object.assign(brandText.style, {
            color: "#ffffff",
            fontWeight: "bold",
            fontSize: "13px",
            letterSpacing: "1px",
            background: "linear-gradient(45deg, #00FF87, #60EFFF)",
            webkitBackgroundClip: "text",
            webkitTextFillColor: "transparent"
        });

        brandContainer.appendChild(logo);
        brandContainer.appendChild(brandText);
        barra.appendChild(brandContainer);

        // Contenedor de botones rápidos
        const buttonsContainer = document.createElement("div");
        Object.assign(buttonsContainer.style, {
            display: "flex",
            flexDirection: "row",
            gap: "10px",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            flex: "1",
            margin: "0 20px"
        });

        const listadoBotones = [
            "matricula", "kms", "diagnosis", "desgaste", 
            "medidas", "pastillas", "discos", "frenos", "material viejo"
        ];

        listadoBotones.forEach(id => {
            const btn = crearBotonRapido(id);
            buttonsContainer.appendChild(btn);
        });

        // Botón especial de configuración (Amarillo)
        const configBtn = document.createElement("button");
        configBtn.textContent = "configuración";
        configBtn.title = "Abrir panel de configuración";
        Object.assign(configBtn.style, {
            background: "#FFCC00",
            border: "1px solid #E5B800",
            color: "#1a1a1a",
            borderRadius: "6px",
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            outline: "none"
        });

        configBtn.addEventListener("mouseenter", () => {
            configBtn.style.background = "#FFE066";
            configBtn.style.transform = "translateY(-2px)";
            configBtn.style.boxShadow = "0 4px 12px rgba(255, 204, 0, 0.3)";
        });

        configBtn.addEventListener("mouseleave", () => {
            configBtn.style.background = "#FFCC00";
            configBtn.style.transform = "translateY(0)";
            configBtn.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
        });

        configBtn.addEventListener("click", () => {
            configBtn.style.transform = "scale(0.95)";
            setTimeout(() => {
                configBtn.style.transform = "translateY(-2px)";
            }, 100);
            chrome.runtime.sendMessage({ action: "openOptions" });
        });

        buttonsContainer.appendChild(configBtn);

        barra.appendChild(buttonsContainer);

        // Botón de cerrar barra
        const closeBtn = document.createElement("button");
        closeBtn.innerHTML = "&times;";
        closeBtn.title = "Cerrar barra";
        Object.assign(closeBtn.style, {
            background: "none",
            border: "none",
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "24px",
            cursor: "pointer",
            padding: "0 5px",
            lineHeight: "1",
            transition: "color 0.2s, transform 0.2s"
        });
        closeBtn.addEventListener("mouseenter", () => {
            closeBtn.style.color = "#FF4949";
            closeBtn.style.transform = "scale(1.1)";
        });
        closeBtn.addEventListener("mouseleave", () => {
            closeBtn.style.color = "rgba(255, 255, 255, 0.5)";
            closeBtn.style.transform = "scale(1)";
        });
        closeBtn.addEventListener("click", () => {
            toggleBarra();
        });

        barra.appendChild(closeBtn);

        // Inyectar en el documento
        document.documentElement.appendChild(barra);

        // Inyectar animaciones clave por CSS
        inyectarEstilosAnimacion();

        // Mostrar notificación de bienvenida
        mostrarToast("Barra rápida activada");
    }

    function crearBotonRapido(id) {
        const btn = document.createElement("button");
        btn.textContent = id.toLowerCase();
        btn.dataset.id = id;

        // Estilos del botón
        Object.assign(btn.style, {
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#e0e0e0",
            borderRadius: "6px",
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            outline: "none"
        });

        // Hover y Focus
        btn.addEventListener("mouseenter", () => {
            btn.style.background = "linear-gradient(135deg, rgba(0, 255, 135, 0.15) 0%, rgba(96, 239, 255, 0.15) 100%)";
            btn.style.borderColor = "rgba(96, 239, 255, 0.4)";
            btn.style.color = "#ffffff";
            btn.style.transform = "translateY(-2px)";
            btn.style.boxShadow = "0 4px 12px rgba(96, 239, 255, 0.15)";
        });

        btn.addEventListener("mouseleave", () => {
            btn.style.background = "rgba(255, 255, 255, 0.05)";
            btn.style.borderColor = "rgba(255, 255, 255, 0.12)";
            btn.style.color = "#e0e0e0";
            btn.style.transform = "translateY(0)";
            btn.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
        });

        btn.addEventListener("click", () => {
            btn.style.transform = "scale(0.95)";
            setTimeout(() => {
                btn.style.transform = "translateY(-2px)";
            }, 100);
            
            // Acción al hacer clic
            ejecutarAccionBoton(id);
        });

        return btn;
    }

    function ejecutarAccionBoton(id) {
        console.log(`Botón de texto rápido presionado: ${id}`);
        
        // Mantener texto a insertar estrictamente en minúsculas
        const labelText = id.toLowerCase();
        
        // Localizar los campos
        const inputNombre = findFieldByLabelText("Nombre del archivo");
        const inputDescripcion = findFieldByLabelText("Descripción del archivo");
        
        let inyectado = false;
        
        if (inputNombre) {
            setInputValue(inputNombre, labelText);
            inyectado = true;
        }
        if (inputDescripcion) {
            setInputValue(inputDescripcion, labelText);
            inyectado = true;
        }
        
        if (inyectado) {
            mostrarToast(`Texto '${labelText}' insertado correctamente`);
        } else {
            mostrarToast(`Error: No se encontraron los campos "Nombre del archivo" o "Descripción del archivo"`, true);
        }
        
        // Plegar la barra automáticamente al presionar
        toggleBarra();
    }

    // Encuentra un input/textarea en el DOM buscando un texto indicador/etiqueta cercano
    function findFieldByLabelText(labelText) {
        const stripAccents = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const cleanLabel = stripAccents(labelText.toLowerCase().trim().replace(":", ""));
        const elements = Array.from(document.querySelectorAll('label, span, div, p, td, th, h1, h2, h3, h4, h5, h6'));
        
        function esInputValido(el) {
            if (!el) return false;
            const tag = el.tagName.toLowerCase();
            if (tag === 'textarea') return true;
            if (tag === 'input') {
                const type = (el.getAttribute('type') || el.type || 'text').toLowerCase();
                const invalidTypes = ['file', 'hidden', 'submit', 'button', 'checkbox', 'radio', 'image', 'reset'];
                return !invalidTypes.includes(type);
            }
            return false;
        }

        function buscarInputValido(startNode) {
            if (!startNode) return null;
            if (esInputValido(startNode)) return startNode;
            const inside = Array.from(startNode.querySelectorAll('input, textarea')).find(esInputValido);
            if (inside) return inside;
            return null;
        }

        // 1. Primer barrido: buscar coincidencia exacta
        let target = elements.find(el => {
            const text = stripAccents(el.textContent.trim().toLowerCase().replace(":", ""));
            return text === cleanLabel;
        });
        
        // 2. Segundo barrido: buscar coincidencia por palabras clave
        if (!target) {
            const keywords = cleanLabel.split(/\s+/).filter(w => w.length > 2);
            if (keywords.length > 0) {
                target = elements.find(el => {
                    const text = stripAccents(el.textContent.trim().toLowerCase());
                    return keywords.every(kw => text.includes(kw));
                });
            }
        }

        if (!target) return null;

        // Si es un <label> con 'for', intentar obtener el input por ID
        if (target.tagName === "LABEL" && target.htmlFor) {
            const input = document.getElementById(target.htmlFor);
            if (esInputValido(input)) return input;
        }

        // Intentar buscar dentro de target o usar target si ya es un input válido
        const inputInsideTarget = buscarInputValido(target);
        if (inputInsideTarget) return inputInsideTarget;

        // Buscar input en hermanos siguientes
        let sibling = target.nextElementSibling;
        while (sibling) {
            const found = buscarInputValido(sibling);
            if (found) return found;
            sibling = sibling.nextElementSibling;
        }

        // Buscar subiendo y explorando la jerarquía cercana (hasta 3 niveles arriba)
        let parent = target.parentElement;
        for (let i = 0; i < 3 && parent; i++) {
            const inputs = Array.from(parent.querySelectorAll('input, textarea')).filter(esInputValido);
            if (inputs.length > 0) {
                const found = inputs.find(inp => inp !== target);
                if (found) return found;
            }
            
            // Buscar en hermanos del padre
            let parentSibling = parent.nextElementSibling;
            while (parentSibling) {
                const found = buscarInputValido(parentSibling);
                if (found) return found;
                parentSibling = parentSibling.nextElementSibling;
            }
            parent = parent.parentElement;
        }

        return null;
    }

    // Modifica de forma segura el valor del input/textarea forzando la actualización en frameworks SPA (React/Angular/Vue)
    function setInputValue(input, value) {
        if (!input) return;
        
        try {
            // Detectar el prototipo correcto para simular la entrada nativa de usuario
            const prototype = input.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
            const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
            
            if (descriptor && descriptor.set) {
                descriptor.set.call(input, value);
            } else {
                input.value = value;
            }
            
            // Disparar eventos nativos para que React, Vue o Angular actualicen sus estados bindings
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        } catch (e) {
            console.error("Error setting input value via prototype descriptor", e);
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    // Sistema de notificaciones integradas (Toast)
    function mostrarToast(mensaje, esError = false) {
        if (!toastContainer) {
            toastContainer = document.createElement("div");
            toastContainer.id = "ng-cpt-toast-container";
            Object.assign(toastContainer.style, {
                position: "fixed",
                bottom: "20px",
                right: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                zIndex: "9999999999",
                fontFamily: "system-ui, sans-serif"
            });
            document.documentElement.appendChild(toastContainer);
        }

        const toast = document.createElement("div");
        toast.textContent = mensaje;
        Object.assign(toast.style, {
            backgroundColor: "rgba(25, 25, 25, 0.9)",
            color: "#ffffff",
            padding: "10px 18px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "500",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            borderLeft: esError ? "3px solid #FF4949" : "3px solid #00FF87",
            opacity: "0",
            transform: "translateY(20px)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        });

        toastContainer.appendChild(toast);

        // Forzar reflujo e iniciar animación de entrada
        setTimeout(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateY(0)";
        }, 10);

        // Desvanecimiento y remoción después de 3 segundos
        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(-10px)";
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    function inyectarEstilosAnimacion() {
        if (document.getElementById("ng-cpt-keyframe-styles")) return;

        const styles = document.createElement("style");
        styles.id = "ng-cpt-keyframe-styles";
        styles.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); opacity: 0.8; }
                100% { transform: scale(1.15); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }

    return {
        init: init,
        toggle: toggleBarra
    };
})();
