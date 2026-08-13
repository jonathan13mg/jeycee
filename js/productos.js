let productos = [];

const listaProductos = document.getElementById("lista-productos");
const listaCategorias = document.getElementById("lista-categorias");
const contador = document.getElementById("contador-productos");
const buscador = document.getElementById("buscador");

let categoriaActual = "Todos";

// Cargar productos
async function cargarProductos() {

    try {

         // Productos base del archivo JSON
         const respuesta = await fetch("data/productos.json");
         const productosBase = await respuesta.json();

         // Productos agregados desde el panel
         const productosGuardados =
             JSON.parse(localStorage.getItem("jeyce_productos")) || [];

        // Unir ambos catálogos
        productos = [...productosBase, ...productosGuardados];

        // Mostrar solo los disponibles
        productos = productos.filter(p => p.disponible !== false);

        crearCategorias();
        mostrarProductos();

    } catch (error) {

        console.error("Error al cargar productos:", error);

    }

}

// Crear categorías automáticamente
function crearCategorias() {

    listaCategorias.innerHTML = "";

    // Botón Todas
    const botonTodas = document.createElement("button");

    botonTodas.className = "categoria-btn";
    botonTodas.textContent = "Todas las categorías";

    botonTodas.onclick = () => {

        categoriaActual = "Todos";
        mostrarProductos();

    };

    listaCategorias.appendChild(botonTodas);

    // Categorías únicas
    const categorias = [...new Set(productos.map(p => p.categoria))];

    categorias.sort();

    categorias.forEach(cat => {

        const boton = document.createElement("button");

        boton.className = "categoria-btn";
        boton.textContent = cat;

        boton.onclick = () => {

            categoriaActual = cat;
            mostrarProductos();

        };

        listaCategorias.appendChild(boton);

    });

}

// Mostrar productos
function mostrarProductos() {

    const texto = normalizar(buscador.value);

    const filtrados = productos.filter(p => {

        const coincideTexto =
            normalizar(p.nombre).includes(texto) ||
            normalizar(p.categoria).includes(texto) ||
            normalizar(p.subcategoria).includes(texto);

        const coincideCategoria =
            categoriaActual === "Todos" ||
            p.categoria === categoriaActual;

        return coincideTexto && coincideCategoria;

    });

    contador.textContent =
        `${filtrados.length} productos disponibles`;

    listaProductos.innerHTML = "";

    if (filtrados.length === 0) {

        listaProductos.innerHTML =
            '<p>No se encontraron productos.</p>';

        return;

    }

    filtrados.forEach(producto => {

        const stock = producto.stock ?? 0;
        const disponible = stock > 0;

        const etiqueta =
            stock === 1
                ? '<div class="badge-producto badge-unica">Pieza única</div>'
                : !disponible
                    ? '<div class="badge-producto badge-agotado">Agotado</div>'
                    : '';
                
        listaProductos.innerHTML += `

            <div class="producto-card">

                ${etiqueta}

                <a href="producto.html?id=${producto.id}">
                
                    ${(() => {
                        const imagenPrincipal =
                             producto.imagenes?.[0] || producto.imagen || "";

                        const src = imagenPrincipal.startsWith("data:")
                            ? imagenPrincipal
                            : "img/productos/" + imagenPrincipal;

                        return `<img src="${src}" alt="${producto.nombre}">`;
                    })()}
                
                </a>

                <div class="producto-info">

                    <a href="producto.html?id=${producto.id}" class="producto-link">
                        <h3>${producto.nombre}</h3>
                    </a>

                    <p class="precio">Bs ${producto.precio}</p>

                    <p class="estado ${
                        stock === 1
                            ? 'disponible'
                            : disponible
                                ? 'disponible'
                                : 'agotado'
                    }">
                        ${
                            stock === 1
                                ? 'Pieza única'
                                : disponible
                                    ? 'Disponible'
                                    : 'Agotado'
                        }
                    </p>

                    ${
                        disponible
                            ? `<a
                                     class="btn-whatsapp"
                                     href="https://wa.me/59175544400?text=Hola,%20quiero%20el%20producto%20${encodeURIComponent(producto.nombre)}"
                                     target="_blank"
                                >
                                     Consultar por WhatsApp
                                </a>`
                            : `<button class="btn-whatsapp btn-agotado" disabled>
                                    Agotado
                               </button>`
                    }

                </div>

            </div>

        `;

    });

}

// Evento del buscador
buscador.addEventListener("input", mostrarProductos);

// Iniciar
cargarProductos();