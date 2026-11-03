/*
 * Activa los bloques de anuncios de Google AdSense.
 * Mientras el ID de editor siga siendo el de ejemplo (ca-pub-XXXXXXXXXXXXXXXX),
 * se muestran recuadros de demostración para que veas dónde irán los anuncios.
 */
(function () {
  var bloques = document.querySelectorAll('ins.adsbygoogle');
  var esDemo = Array.prototype.some.call(bloques, function (b) {
    return /X{6,}/.test(b.getAttribute('data-ad-client') || '');
  });

  if (esDemo) {
    bloques.forEach(function (b) {
      var caja = b.parentElement;
      caja.classList.add('anuncio--demo');
      caja.textContent = 'Espacio publicitario (Google AdSense)';
    });
    return;
  }

  bloques.forEach(function () {
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { /* bloqueador de anuncios */ }
  });
})();

document.querySelectorAll('.anio').forEach(function (el) { el.textContent = new Date().getFullYear(); });
