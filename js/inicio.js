const slides = document.querySelectorAll(".slide");

let indice = 0;

function cambiarSlide() {

    slides[indice].classList.remove("activo");

    indice = (indice + 1) % slides.length;

    slides[indice].classList.add("activo");

}

setInterval(cambiarSlide, 4000);