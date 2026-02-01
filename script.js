// Event listeners para tracking
document.getElementById('btn-cta').addEventListener('click', function() {
    console.log('Click en CTA principal');
    // Aquí irán tus eventos de GA4/GTM
});

document.querySelectorAll('.btn-comprar').forEach(function(boton) {
    boton.addEventListener('click', function() {
        console.log('Click en botón comprar');
        alert('Producto añadido al carrito (simulado)');
    });
});