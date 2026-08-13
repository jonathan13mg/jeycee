import {
    db,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "./firebase.js";

const form = document.getElementById("form-producto");
const listaAdmin = document.getElementById("lista-admin");

let productoEditando = null;

let imagenesTemporales = [];

const inputImagenes = document.getElementById("imagenes");
const previewImagenes = document.getElementById("preview-imagenes");

const categoriaSelect = document.getElementById("categoria");
const subcategoriaSelect = document.getElementById("subcategoria");

let categorias = [];

// Vista previa de la imagen
inputImagenes.addEventListener("change", function () {

    const archivos = Array.from(this.files).slice(0, 5);

    Promise.all(
        archivos.map(archivo =>
            new Promise(resolve => {

                const lector = new FileReader();

                lector.onload = e => resolve(e.target.result);

                lector.readAsDataURL(archivo);

            })
        )
    ).then(imagenes => {

        // Mantener el orden exacto en que seleccionaste los archivos
        imagenesTemporales = imagenes;

        // Dibujar las miniaturas con el botón de portada
        renderizarMiniaturasAdmin();

    });

});

// =====================
// CARGAR PRODUCTOS
// =====================
// =====================
// CARGAR CATEGORÍAS
// =====================
async function cargarCategorias() {

    const respuesta = await fetch("data/categorias.json");

    categorias = await respuesta.json();

    categoriaSelect.innerHTML = "";

    categorias.forEach(cat => {

        categoriaSelect.innerHTML +=
            `<option value="${cat.categoria}">${cat.categoria}</option>`;

    });

    actualizarSubcategorias();

}

function actualizarSubcategorias() {

    const categoriaActual = categoriaSelect.value;

    const categoria = categorias.find(
        c => c.categoria === categoriaActual
    );

    subcategoriaSelect.innerHTML = "";

    if (!categoria) return;

    categoria.subcategorias.forEach(sub => {

        subcategoriaSelect.innerHTML +=
            `<option value="${sub}">${sub}</option>`;

    });

}

categoriaSelect.addEventListener(
    "change",
    actualizarSubcategorias
);

async function cargarProductos() {

    const respuesta = await fetch("data/productos.json");
    const productosBase = await respuesta.json();

    const productosGuardados =
        JSON.parse(localStorage.getItem("jeyce_productos")) || [];

    mostrarInventario(productosBase, productosGuardados);

}

// =====================
// MOSTRAR INVENTARIO
// =====================
function mostrarInventario(base, guardados) {

    listaAdmin.innerHTML = "";

    // Productos base
    base.forEach(producto => {

        const imagen = producto.imagen.startsWith("data:")
            ? producto.imagen
            : `img/productos/${producto.imagen}`;

        listaAdmin.innerHTML += `
            <div class="producto-card">

                <img src="${imagen}" alt="${producto.nombre}">

                <div class="producto-info">

                    <h3>${producto.nombre}</h3>

                    <p class="precio">Bs ${producto.precio}</p>

                    <p>Stock: ${producto.stock ?? "No definido"}</p>

                    <p>${producto.categoria}</p>

                    <p style="color:#777;font-size:14px;">
                        Producto base
                    </p>

                </div>

            </div>
        `;

    });

    // Productos agregados desde el panel
    guardados.forEach(producto => {

        // Compatibilidad con productos antiguos (imagen) y nuevos (imagenes[])
        let imagenPrincipal = "";

        if (producto.imagenes && producto.imagenes.length > 0) {
            imagenPrincipal = producto.imagenes[0];
        } else if (producto.imagen) {
            imagenPrincipal = producto.imagen;
        }

        const imagen = imagenPrincipal
            ? (imagenPrincipal.startsWith("data:")
                ? imagenPrincipal
                : `img/productos/${imagenPrincipal}`)
            : "";

        listaAdmin.innerHTML += `
            <div class="producto-card">

                <img
                    src="${imagen || 'img/productos/placeholder.jpg'}"
                    alt="${producto.nombre}"
                >

                <div class="producto-info">

                    <h3>${producto.nombre}</h3>

                    <p class="precio">Bs ${producto.precio}</p>

                    <p>Stock: ${producto.stock ?? "No definido"}</p>

                    <p>${producto.categoria}</p>

                    <button
                        class="btn-principal btn-editar"
                        onclick="editarProducto(${producto.id})"
                    >
                        Editar
                    </button>

                    <button
                        class="btn-whatsapp btn-eliminar"
                        onclick="eliminarProducto(${producto.id})"
                    >
                        Eliminar
                    </button>

                </div>

            </div>
        `;

    });

}

// =====================
// AGREGAR / EDITAR
// =====================
form.addEventListener("submit", function (e) {

    e.preventDefault();

    let guardados =
        JSON.parse(localStorage.getItem("jeyce_productos")) || [];

    const nuevoProducto = {

        id: productoEditando || Date.now(),

        nombre: document.getElementById("nombre").value.trim(),

        precio: Number(document.getElementById("precio").value),

        stock: Number(document.getElementById("stock").value),

        categoria: document.getElementById("categoria").value,

        subcategoria: document.getElementById("subcategoria").value.trim(),

        marca: document.getElementById("marca").value.trim(),

        talla: document.getElementById("talla").value.trim(),

        estado: document.getElementById("estado").value,

        codigo: document.getElementById("codigo").value.trim(),

        imagenes: imagenesTemporales,

        disponible: Number(document.getElementById("stock").value) > 0

    };

    if (productoEditando) {

        const index =
            guardados.findIndex(p => p.id === productoEditando);

        if (index !== -1) {
            guardados[index] = nuevoProducto;
        }

        alert("Producto actualizado correctamente");

    } else {

        guardados.push(nuevoProducto);

        alert("Producto agregado correctamente");

    }

    localStorage.setItem(
        "jeyce_productos",
        JSON.stringify(guardados)
    );

    // Reiniciar formulario
    productoEditando = null;

    imagenesTemporales = [];

    form.reset();

    actualizarSubcategorias();

    previewImagenes.innerHTML = "";

    document.querySelector("button[type='submit']").textContent =
        "Agregar producto";

    cargarProductos();

});

// =====================
// ELIMINAR
// =====================
function eliminarProducto(id) {

    let guardados =
        JSON.parse(localStorage.getItem("jeyce_productos")) || [];

    guardados =
        guardados.filter(p => p.id !== id);

    localStorage.setItem(
        "jeyce_productos",
        JSON.stringify(guardados)
    );

    cargarProductos();

}

function renderizarMiniaturasAdmin() {

    previewImagenes.innerHTML = "";

    imagenesTemporales.forEach((src, index) => {

        const item = document.createElement("div");
        item.className = "preview-item";

        const img = document.createElement("img");

        img.src = src.startsWith("data:")
            ? src
            : `img/productos/${src}`;
            
        // Botón para elegir portada
        const botonPortada = document.createElement("button");
        botonPortada.className = "btn-portada";

        botonPortada.textContent =
            index === 0 ? "Portada ✓" : "Usar como portada";

        botonPortada.addEventListener("click", () => {

            const seleccionada = imagenesTemporales.splice(index, 1)[0];

            imagenesTemporales.unshift(seleccionada);

            renderizarMiniaturasAdmin();

        });

        // Botón para eliminar imagen
        const botonEliminar = document.createElement("button");
        botonEliminar.className = "btn-eliminar-imagen";
        botonEliminar.textContent = "Eliminar";

        botonEliminar.addEventListener("click", () => {

            imagenesTemporales.splice(index, 1);

            renderizarMiniaturasAdmin();

        });

        item.appendChild(img);
        item.appendChild(botonPortada);
        item.appendChild(botonEliminar);

        previewImagenes.appendChild(item);

    });

}

// =====================
// EDITAR
// =====================
function editarProducto(id) {
    const guardados =
        JSON.parse(localStorage.getItem("jeyce_productos")) || [];

    const producto =
        guardados.find(p => p.id === id);

    if (!producto) return;

    productoEditando = id;

    document.getElementById("nombre").value =
        producto.nombre;

    document.getElementById("precio").value =
        producto.precio;

    document.getElementById("stock").value =
        producto.stock || 0;

    // Cargar categoría y subcategoría correctamente
    document.getElementById("categoria").value =
        producto.categoria;

    // Regenerar las opciones de subcategoría según la categoría seleccionada
    actualizarSubcategorias();

    // Seleccionar la subcategoría del producto
    document.getElementById("subcategoria").value =
        producto.subcategoria;

    document.getElementById("marca").value =
        producto.marca || "";

    document.getElementById("talla").value =
        producto.talla || "";

    document.getElementById("estado").value =
       producto.estado || "";
       
    document.getElementById("codigo").value =
       producto.codigo || "";

    // Mostrar miniaturas de las imágenes guardadas

    imagenesTemporales = producto.imagenes || [];

    renderizarMiniaturasAdmin();

    document.querySelector("button[type='submit']").textContent =
        "Guardar cambios";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

// =====================
// INICIAR
// =====================
async function iniciarAdmin() {

    await cargarCategorias();
    await cargarProductos();

}

iniciarAdmin();
