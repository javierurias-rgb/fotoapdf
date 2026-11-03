/* FotoaPDF: convierte imágenes a PDF directamente en el navegador. */
(function () {
  'use strict';

  var PAGINAS = { a4: [595.28, 841.89], letter: [612, 792], legal: [612, 1008] };
  var CALIDADES = {
    alta:  { lado: 3500, q: 0.92 },
    media: { lado: 2000, q: 0.80 },
    baja:  { lado: 1200, q: 0.60 }
  };

  var $ = function (id) { return document.getElementById(id); };
  var zona = $('zona'), input = $('archivos'), panel = $('panel'), lista = $('lista');
  var contador = $('contador'), btnConvertir = $('convertir'), progreso = $('progreso');
  var resultado = $('resultado');

  var fotos = [];      // { id, archivo, url, giro }
  var siguienteId = 1;
  var arrastrado = null;

  /* ---------- Carga de archivos ---------- */
  zona.addEventListener('click', function () { input.click(); });
  zona.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
  });
  $('agregar').addEventListener('click', function () { input.click(); });
  input.addEventListener('change', function () { agregar(input.files); input.value = ''; });

  ['dragenter', 'dragover'].forEach(function (ev) {
    zona.addEventListener(ev, function (e) {
      if (!tieneArchivos(e)) return;
      e.preventDefault(); zona.classList.add('activa');
    });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    zona.addEventListener(ev, function () { zona.classList.remove('activa'); });
  });
  zona.addEventListener('drop', function (e) {
    if (!tieneArchivos(e)) return;
    e.preventDefault(); agregar(e.dataTransfer.files);
  });
  // Evita que el navegador abra la imagen si se suelta fuera de la zona.
  window.addEventListener('dragover', function (e) { if (tieneArchivos(e)) e.preventDefault(); });
  window.addEventListener('drop', function (e) {
    if (tieneArchivos(e)) { e.preventDefault(); agregar(e.dataTransfer.files); }
  });

  function tieneArchivos(e) {
    return e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types, 'Files') !== -1;
  }

  function agregar(lista) {
    var archivos = Array.prototype.filter.call(lista, function (f) {
      return /^image\//.test(f.type) || /\.(jpe?g|png|webp|gif|bmp|heic|heif|avif)$/i.test(f.name);
    });
    if (!archivos.length) return mostrarResultado('Los archivos seleccionados no son imágenes.', true);

    var rechazadas = [];
    Promise.all(archivos.map(function (archivo) {
      var url = URL.createObjectURL(archivo);
      return cargarImagen(url).then(function () {
        return { id: siguienteId++, archivo: archivo, url: url, giro: 0 };
      }, function () {
        URL.revokeObjectURL(url);
        rechazadas.push(archivo.name);
        return null;
      });
    })).then(function (nuevas) {
      // Conserva el orden en que se seleccionaron los archivos
      nuevas.forEach(function (f) { if (f) fotos.push(f); });
      dibujar();
      if (rechazadas.length) {
        mostrarResultado('Tu navegador no pudo abrir: ' + rechazadas.join(', ') +
          '. Si son fotos HEIC de iPhone, conviértelas primero a JPG.', true);
      } else {
        resultado.hidden = true;
      }
    });
  }

  function cargarImagen(url) {
    return new Promise(function (ok, fallo) {
      var img = new Image();
      img.onload = function () { ok(img); };
      img.onerror = fallo;
      img.src = url;
    });
  }

  /* ---------- Lista de miniaturas ---------- */
  function dibujar() {
    lista.innerHTML = '';
    fotos.forEach(function (f, i) {
      var li = document.createElement('li');
      li.className = 'item';
      li.draggable = true;
      li.dataset.id = f.id;
      li.innerHTML =
        '<span class="item__num">' + (i + 1) + '</span>' +
        '<div class="item__marco"><img alt="" class="' + (f.giro % 180 ? 'girado' : '') + '" style="transform:rotate(' + f.giro + 'deg)"></div>' +
        '<p class="item__nombre"></p>' +
        '<div class="item__botones">' +
          '<button type="button" data-accion="izq" title="Mover a la izquierda" aria-label="Mover a la izquierda">◀</button>' +
          '<button type="button" data-accion="girar" title="Girar 90°" aria-label="Girar 90 grados">↻</button>' +
          '<button type="button" data-accion="der" title="Mover a la derecha" aria-label="Mover a la derecha">▶</button>' +
          '<button type="button" data-accion="quitar" title="Quitar" aria-label="Quitar imagen">✕</button>' +
        '</div>';
      li.querySelector('img').src = f.url;
      li.querySelector('.item__nombre').textContent = f.archivo.name;
      li.querySelector('.item__nombre').title = f.archivo.name;
      lista.appendChild(li);
    });

    contador.textContent = fotos.length;
    panel.hidden = fotos.length === 0;
    zona.classList.toggle('compacta', fotos.length > 0);
  }

  function indice(id) {
    for (var i = 0; i < fotos.length; i++) if (fotos[i].id === id) return i;
    return -1;
  }

  lista.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-accion]');
    if (!btn) return;
    var i = indice(Number(btn.closest('.item').dataset.id));
    var accion = btn.dataset.accion;
    if (accion === 'girar') fotos[i].giro = (fotos[i].giro + 90) % 360;
    else if (accion === 'izq' && i > 0) fotos.splice(i - 1, 0, fotos.splice(i, 1)[0]);
    else if (accion === 'der' && i < fotos.length - 1) fotos.splice(i + 1, 0, fotos.splice(i, 1)[0]);
    else if (accion === 'quitar') { URL.revokeObjectURL(fotos[i].url); fotos.splice(i, 1); }
    dibujar();
  });

  // Reordenar arrastrando (escritorio)
  lista.addEventListener('dragstart', function (e) {
    var li = e.target.closest('.item'); if (!li) return;
    arrastrado = Number(li.dataset.id);
    li.classList.add('arrastrando');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(arrastrado));
  });
  lista.addEventListener('dragover', function (e) {
    if (arrastrado === null) return;
    e.preventDefault();
    var li = e.target.closest('.item');
    lista.querySelectorAll('.destino').forEach(function (n) { n.classList.remove('destino'); });
    if (li && Number(li.dataset.id) !== arrastrado) li.classList.add('destino');
  });
  lista.addEventListener('drop', function (e) {
    if (arrastrado === null) return;
    e.preventDefault(); e.stopPropagation();
    var li = e.target.closest('.item');
    if (li) {
      var desde = indice(arrastrado), hasta = indice(Number(li.dataset.id));
      if (desde !== hasta) fotos.splice(hasta, 0, fotos.splice(desde, 1)[0]);
    }
    arrastrado = null;
    dibujar();
  });
  lista.addEventListener('dragend', function () {
    arrastrado = null;
    lista.querySelectorAll('.arrastrando, .destino').forEach(function (n) {
      n.classList.remove('arrastrando', 'destino');
    });
  });

  $('ordenar').addEventListener('click', function () {
    fotos.sort(function (a, b) {
      return a.archivo.name.localeCompare(b.archivo.name, 'es', { numeric: true, sensitivity: 'base' });
    });
    dibujar();
  });
  $('limpiar').addEventListener('click', function () {
    fotos.forEach(function (f) { URL.revokeObjectURL(f.url); });
    fotos = [];
    resultado.hidden = true;
    dibujar();
  });

  /* ---------- Conversión ---------- */
  btnConvertir.addEventListener('click', function () {
    if (!fotos.length) return;
    if (!window.jspdf) return mostrarResultado('No se pudo cargar el generador de PDF. Recarga la página.', true);
    convertir().catch(function (err) {
      console.error(err);
      mostrarResultado('Ocurrió un error al crear el PDF. Prueba con menos fotos o con calidad más baja.', true);
    }).then(function () {
      btnConvertir.disabled = false;
      btnConvertir.textContent = 'Convertir a PDF';
      progreso.hidden = true;
    });
  });

  function convertir() {
    var tamano = $('tamano').value;
    var orientacion = $('orientacion').value;
    var margen = Number($('margen').value);
    var calidad = CALIDADES[$('calidad').value];
    var nombre = ($('nombre').value.trim() || 'fotos').replace(/[\\/:*?"<>|]+/g, '-').replace(/\.pdf$/i, '');

    btnConvertir.disabled = true;
    btnConvertir.textContent = 'Creando PDF…';
    resultado.hidden = true;
    progreso.hidden = false;

    var doc = null;
    var cola = fotos.slice();
    var lienzo = document.createElement('canvas');
    var ctx = lienzo.getContext('2d');

    function paso(i) {
      if (i >= cola.length) return Promise.resolve();
      actualizarProgreso(i, cola.length);

      return cargarImagen(cola[i].url).then(function (img) {
        var giro = cola[i].giro;
        var lateral = giro === 90 || giro === 270;
        var anchoOrig = lateral ? img.naturalHeight : img.naturalWidth;
        var altoOrig = lateral ? img.naturalWidth : img.naturalHeight;

        // Redimensiona según la calidad elegida
        var escala = Math.min(1, calidad.lado / Math.max(anchoOrig, altoOrig));
        var ancho = Math.max(1, Math.round(anchoOrig * escala));
        var alto = Math.max(1, Math.round(altoOrig * escala));
        lienzo.width = ancho;
        lienzo.height = alto;
        ctx.fillStyle = '#ffffff';            // fondo blanco para PNG transparentes
        ctx.fillRect(0, 0, ancho, alto);
        ctx.save();
        ctx.translate(ancho / 2, alto / 2);
        ctx.rotate(giro * Math.PI / 180);
        var dw = (lateral ? alto : ancho), dh = (lateral ? ancho : alto);
        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();

        return aBytes(lienzo, calidad.q).then(function (bytes) {
          var horizontal = ancho > alto;
          var pw, ph;

          if (tamano === 'ajustar') {
            // Página del tamaño de la foto (lado largo = 842 pt, como un A4)
            var k = 841.89 / Math.max(ancho, alto);
            pw = ancho * k + margen * 2;
            ph = alto * k + margen * 2;
          } else {
            var base = PAGINAS[tamano];
            var hor = orientacion === 'l' || (orientacion === 'auto' && horizontal);
            pw = hor ? base[1] : base[0];
            ph = hor ? base[0] : base[1];
          }

          var formato = [pw, ph];
          var orient = pw > ph ? 'l' : 'p';
          if (!doc) doc = new window.jspdf.jsPDF({ unit: 'pt', format: formato, orientation: orient, compress: true });
          else doc.addPage(formato, orient);

          // Ajusta la imagen dentro del área útil y la centra
          var areaW = pw - margen * 2, areaH = ph - margen * 2;
          var s = Math.min(areaW / ancho, areaH / alto);
          var w = ancho * s, h = alto * s;
          doc.addImage(bytes, 'JPEG', (pw - w) / 2, (ph - h) / 2, w, h, 'img' + i, 'NONE');

          return new Promise(function (r) { setTimeout(r, 0); }); // deja respirar a la interfaz
        });
      }).then(function () { return paso(i + 1); });
    }

    return paso(0).then(function () {
      actualizarProgreso(cola.length, cola.length);
      lienzo.width = lienzo.height = 0;
      var blob = doc.output('blob');
      descargar(blob, nombre + '.pdf');
      mostrarResultado('¡Listo! Se descargó <strong></strong> (' + cola.length + ' página' +
        (cola.length === 1 ? '' : 's') + ', ' + formatoTamano(blob.size) + ').', false, nombre + '.pdf');
    });
  }

  function aBytes(lienzo, q) {
    return new Promise(function (ok, fallo) {
      lienzo.toBlob(function (blob) {
        if (!blob) return fallo(new Error('toBlob falló'));
        blob.arrayBuffer().then(function (buf) { ok(new Uint8Array(buf)); }, fallo);
      }, 'image/jpeg', q);
    });
  }

  function descargar(blob, nombreArchivo) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  }

  function actualizarProgreso(hecho, total) {
    var pct = Math.round(hecho / total * 100);
    progreso.querySelector('.progreso__barra').style.width = pct + '%';
    progreso.querySelector('.progreso__texto').textContent =
      hecho < total ? 'Procesando imagen ' + (hecho + 1) + ' de ' + total + '…' : 'Generando archivo…';
  }

  function mostrarResultado(html, esError, nombreArchivo) {
    resultado.innerHTML = html;
    if (nombreArchivo) resultado.querySelector('strong').textContent = nombreArchivo;
    resultado.classList.toggle('error', !!esError);
    resultado.hidden = false;
  }

  function formatoTamano(b) {
    if (b < 1024 * 1024) return Math.max(1, Math.round(b / 1024)) + ' KB';
    return (b / 1024 / 1024).toFixed(1) + ' MB';
  }
})();
