async function cargarProducto() {

    const parametros = new URLSearchParams(window.location.search);
    const id = Number(parametros.get("id"));

    // Productos base del archivo JSON
    const respuesta = await fetch("data/productos.json");
    const productosBase = await respuesta.json();

    // Productos agregados desde el panel de administración
    const productosGuardados =
        JSON.parse(localStorage.getItem("jeyce_productos")) || [];

    // Unimos ambos inventarios
    const productos = [...productosBase, ...productosGuardados];

    const producto = productos.find(p => p.id === id);

    if (!producto) {
        document.body.innerHTML = "<h1>Producto no encontrado</h1>";
        return;
    }

    // =====================
    // GALERÍA DE IMÁGENES
    // Compatible con imagen e imagenes[]
    // =====================
    
    const imagenPrincipal = document.getElementById("imagen-producto");
    const galeria = document.getElementById("galeria-miniaturas");

    // Obtener todas las imágenes del producto
    const imagenes = (producto.imagenes && producto.imagenes.length > 0)
        ? producto.imagenes
        : [producto.imagen];

    imagenesActuales = imagenes.map(img =>
        img.startsWith("data:")
        ? img
        : `img/productos/${img}`
    );

    // Imagen principal
    const imagenPrincipalSrc = imagenes[0].startsWith("data:")
        ? imagenes[0]
        : `img/productos/${imagenes[0]}`;

    imagenPrincipal.src = imagenPrincipalSrc;

    imagenPrincipal.addEventListener("click", () => {

        const indice = imagenesActuales.indexOf(imagenPrincipal.src);

        abrirVisor(indice >= 0 ? indice : 0);

    });

    // Limpiar galería
    galeria.innerHTML = "";

    // Función para cambiar la imagen principal
    function cambiarImagen(src, miniaturaActiva) {

        imagenPrincipal.src = src;

        document.querySelectorAll(".miniatura").forEach(m =>
            m.classList.remove("activa")
        );

        miniaturaActiva.classList.add("activa");

    }

    // Crear miniaturas automáticamente (máximo 5)
    imagenes.slice(0, 5).forEach((img, index) => {

        const src = img.startsWith("data:")
            ? img
            : `img/productos/${img}`;

        const miniatura = document.createElement("img");

        miniatura.src = src;
        miniatura.className =
            index === 0 ? "miniatura activa" : "miniatura";

        miniatura.alt = `Imagen ${index + 1}`;

        miniatura.addEventListener("click", () =>
            cambiarImagen(src, miniatura)
        );

        galeria.appendChild(miniatura);

    });

    document.getElementById("nombre-producto").textContent =
        producto.nombre;

    document.getElementById("precio-producto").textContent =
        `Bs ${producto.precio}`;

    document.getElementById("categoria-producto").textContent =
        `${producto.categoria} / ${producto.subcategoria}`;

    if (producto.marca) {

        document.getElementById("marca-producto").textContent =
           producto.marca;

    } else {

        document.getElementById("marca-producto")
            .parentElement.style.display = "none";

    }

    if (producto.talla) {

        document.getElementById("talla-producto").textContent =
            producto.talla;

    } else {

        document.getElementById("talla-producto")
            .parentElement.style.display = "none";

    }

    if (producto.estado) {

        document.getElementById("estado-producto").textContent =
            producto.estado;

    } else {

        document.getElementById("estado-producto")
            .parentElement.style.display = "none";

    }

    if (producto.codigo) {

        document.getElementById("codigo-producto").textContent =
            producto.codigo;

    } else {

        document.getElementById("codigo-producto")
            .parentElement.style.display = "none";

    }

    if (producto.origen) {

        document.getElementById("origen-producto").textContent =
            producto.origen;

    } else {

        document.getElementById("origen-producto")
            .parentElement.style.display = "none";

    }

    const stock = producto.stock ?? 0;
    const disponible = stock > 0;

    const stockElemento = document.getElementById("stock-producto");

    if (stock === 1) {

        stockElemento.textContent = "Pieza única";
        stockElemento.className = "stock disponible";

    } else if (disponible) {

        stockElemento.textContent = `Disponible (${stock} unidades)`;
        stockElemento.className = "stock disponible";

    } else {

        stockElemento.textContent = "Agotado";
        stockElemento.className = "stock agotado";

    }

    document.getElementById("descripcion-producto").textContent =
        "Producto importado con stock limitado. Las unidades son únicas y pueden agotarse rápidamente. Contáctanos por WhatsApp para confirmar disponibilidad y reservar tu compra.";

    const boton = document.getElementById("btn-comprar");
    
    if (disponible) {
        
        boton.href =
            `https://wa.me/59175544400?text=Hola,%20quiero%20comprar%20el%20producto%20${encodeURIComponent(producto.nombre)}%20por%20Bs%20${producto.precio}`;
            
        boton.textContent = "Comprar por WhatsApp";
        
        boton.classList.remove("btn-agotado");
        
        boton.removeAttribute("disabled");
    
    } else {
        
        boton.removeAttribute("href");
        
        boton.textContent = "Producto agotado";
        
        boton.classList.add("btn-agotado");
        
        boton.setAttribute("disabled", "true");

    }
        
}

// =====================
// VISOR DE IMAGEN
// =====================

const visor = document.getElementById("visor-imagen");
const imagenVisor = document.getElementById("imagen-visor");
const cerrarVisor = document.getElementById("cerrar-visor");
const visorAnterior = document.getElementById("visor-anterior");
const visorSiguiente = document.getElementById("visor-siguiente");

let imagenesActuales = [];
let indiceImagenActual = 0;
let escalaVisor = 1;
let arrastrando = false;
let ultimoToque = 0;
let inicioX = 0;
let inicioY = 0;
let desplazamientoX = 0;
let desplazamientoY = 0;
const imagenPrincipalElemento = document.getElementById("imagen-producto");

function abrirVisor(indice = 0) {

    if (imagenesActuales.length === 0) return;

    indiceImagenActual = indice;

    imagenVisor.src = imagenesActuales[indiceImagenActual];

    escalaVisor = 1;
    desplazamientoX = 0;
    desplazamientoY = 0;
    actualizarTransformacion();

    visor.classList.add("activo");

    document.body.style.overflow = "hidden";
}

function actualizarTransformacion() {
    imagenVisor.style.transform =
        `translate(${desplazamientoX}px, ${desplazamientoY}px) scale(${escalaVisor})`;
}

function distanciaEntreDedos(t1, t2) {
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function cerrarVisorImagen() {
    visor.classList.remove("activo");
    imagenVisor.src = "";

    escalaVisor = 1;
    desplazamientoX = 0;
    desplazamientoY = 0;
    actualizarTransformacion();

    document.body.style.overflow = "";
}

cerrarVisor.addEventListener("click", cerrarVisorImagen);

visorAnterior.addEventListener("click", () => {

    if (imagenesActuales.length === 0) return;

    indiceImagenActual =
        (indiceImagenActual - 1 + imagenesActuales.length) %
        imagenesActuales.length;

    imagenVisor.src = imagenesActuales[indiceImagenActual];

    // Reiniciar zoom
    escalaVisor = 1;
    desplazamientoX = 0;
    desplazamientoY = 0;
    actualizarTransformacion();

});

visorSiguiente.addEventListener("click", () => {

    if (imagenesActuales.length === 0) return;

    indiceImagenActual =
        (indiceImagenActual + 1) %
        imagenesActuales.length;

    imagenVisor.src = imagenesActuales[indiceImagenActual];

    // Reiniciar zoom
    escalaVisor = 1;
    desplazamientoX = 0;
    desplazamientoY = 0;
    actualizarTransformacion();

});

// Zoom con la rueda del mouse
visor.addEventListener("wheel", (e) => {

    if (!visor.classList.contains("activo")) return;

    e.preventDefault();

    if (e.deltaY < 0) {
        escalaVisor = Math.min(4, escalaVisor + 0.2);
    } else {
        escalaVisor = Math.max(1, escalaVisor - 0.2);
    }

    actualizarTransformacion();

}, { passive: false });

// Arrastrar imagen ampliada (versión profesional)
imagenVisor.addEventListener("pointerdown", (e) => {

    if (escalaVisor <= 1) return;

    e.preventDefault();

    arrastrando = true;

    inicioX = e.clientX - desplazamientoX;
    inicioY = e.clientY - desplazamientoY;

    imagenVisor.setPointerCapture(e.pointerId);

    imagenVisor.style.cursor = "grabbing";

});

imagenVisor.addEventListener("pointermove", (e) => {

    if (!arrastrando) return;

    desplazamientoX = e.clientX - inicioX;
    desplazamientoY = e.clientY - inicioY;

    actualizarTransformacion();

});

function terminarArrastre() {

    arrastrando = false;

    imagenVisor.style.cursor =
        escalaVisor > 1 ? "grab" : "zoom-in";

}

imagenVisor.addEventListener("pointerup", terminarArrastre);

imagenVisor.addEventListener("pointercancel", terminarArrastre);

imagenVisor.addEventListener("pointerleave", (e) => {

    if (arrastrando && e.buttons === 0) {
        terminarArrastre();
    }

});

// =====================
// DOBLE TOQUE PARA ZOOM (CELULAR)
// =====================

imagenVisor.addEventListener("touchend", (e) => {

    const ahora = Date.now();

    if (ahora - ultimoToque < 300) {

        e.preventDefault();

        if (escalaVisor === 1) {

            escalaVisor = 2;

            imagenVisor.style.cursor = "grab";

        } else {

            escalaVisor = 1;

            desplazamientoX = 0;
            desplazamientoY = 0;

            imagenVisor.style.cursor = "zoom-in";

        }

        actualizarTransformacion();

    }

    ultimoToque = ahora;

}, { passive: false });

visor.addEventListener("click", (e) => {
    if (e.target === visor) {
        cerrarVisorImagen();
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && visor.classList.contains("activo")) {
        cerrarVisorImagen();
    }
});

cargarProducto();