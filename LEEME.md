# FotoaPDF: convertidor gratuito de fotos a PDF con Google AdSense

Sitio web estático (HTML + CSS + JavaScript) que convierte imágenes a PDF **dentro del navegador**. No necesita servidor ni base de datos, así que puedes alojarlo gratis.

## Estructura

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Página principal: el convertidor, la guía y las preguntas frecuentes (con 3 espacios de anuncio) |
| `privacidad.html` | Política de privacidad con el texto de cookies de Google (**obligatoria para AdSense**) |
| `terminos.html`, `acerca.html`, `contacto.html` | Páginas que AdSense revisa para aprobar el sitio |
| `ads.txt` | Autoriza a Google a vender anuncios en tu dominio |
| `sitemap.xml`, `robots.txt` | Para que Google indexe el sitio |
| `js/app.js` | Lógica del convertidor |
| `js/anuncios.js` | Activa los anuncios; mientras no configures tu ID, muestra recuadros de ejemplo |
| `vendor/jspdf.umd.min.js` | Librería jsPDF 2.5.2 (licencia MIT), incluida localmente |
| `configurar.sh` | Pone tu ID de AdSense, tu dominio y tu correo en todos los archivos |

## Funciones

- Arrastrar y soltar o seleccionar varias fotos (JPG, PNG, WEBP, GIF y BMP; HEIC solo en Safari)
- Reordenar las fotos arrastrando, con flechas (en el celular) o por nombre
- Girar o quitar cada foto
- Tamaño de página: ajustado a la foto, A4, Carta u Oficio
- Orientación automática, vertical u horizontal; tres márgenes; tres niveles de calidad para controlar el peso del PDF
- Funciona en el celular y en modo oscuro

## Paso 1: Probarlo en tu computadora

```bash
cd fotos-a-pdf
python3 -m http.server 8000
```
Abre http://localhost:8000

## Paso 2: Comprar un dominio

AdSense **no aprueba** subdominios gratuitos (por ejemplo, `usuario.github.io` o `sitio.netlify.app`). Compra un dominio propio (`.com` o `.com.mx`) en Namecheap, Cloudflare, GoDaddy o Neubox, por ejemplo `convertirfotosapdf.com`.

## Paso 3: Publicarlo gratis

Cualquiera de estas opciones funciona. Solo sube la carpeta tal cual:

- **Cloudflare Pages** (recomendado): pages.cloudflare.com → *Create project* → *Upload assets* → arrastra la carpeta. Después, en *Custom domains*, conecta tu dominio.
- **Netlify**: app.netlify.com/drop → arrastra la carpeta → *Domain settings*.
- **GitHub Pages**: sube la carpeta a un repositorio → *Settings › Pages* → configura tu dominio.

Todas incluyen HTTPS gratis, que AdSense requiere.

## Paso 4: Solicitar Google AdSense

1. Entra a https://adsense.google.com y regístrate con tu dominio.
2. Copia tu **ID de editor** (tiene la forma `ca-pub-1234567890123456`).
3. Aplica tu ID, dominio y correo a todos los archivos:
   ```bash
   ./configurar.sh ca-pub-1234567890123456 tudominio.com contacto@tudominio.com
   ```
   (En Windows, usa *Buscar y reemplazar en archivos* de VS Code: cambia `ca-pub-XXXXXXXXXXXXXXXX`, `pub-XXXXXXXXXXXXXXXX`, `contacto@tudominio.com` y `tudominio.com`.)
4. Vuelve a subir el sitio.
5. En AdSense, pulsa **Verificar** y luego **Solicitar revisión**. La aprobación suele tardar de unos días a 4 semanas.
6. **Consentimiento de cookies (UE y Reino Unido)**: en AdSense, ve a *Privacidad y mensajes › Europa* y activa el mensaje de consentimiento de Google. Es gratis y no requiere cambios en el código.

## Paso 5: Crear los bloques de anuncios (después de la aprobación)

- **Opción fácil, Anuncios automáticos:** en AdSense, activa *Anuncios › Anuncios automáticos*. El script que ya está en el `<head>` de todas las páginas se encarga del resto.
- **Opción manual:** crea 3 bloques *Display* adaptables en *Anuncios › Por bloque de anuncios*. En `index.html`, sustituye `data-ad-slot="1111111111"`, `"2222222222"` y `"3333333333"` por los números de tus bloques.

## Consejos para que te aprueben y ganar más

- **Contenido:** AdSense rechaza los sitios que son "solo una herramienta". La página ya incluye guía y preguntas frecuentes. Te conviene agregar 5 a 10 artículos útiles, por ejemplo "Cómo escanear documentos con el celular", "Cómo reducir el peso de un PDF" o "Cómo enviar tu INE en PDF".
- **Tráfico:** registra el sitio en Google Search Console y envía `sitemap.xml`.
- **Reglas:** no hagas clic en tus propios anuncios y no pidas a otros que lo hagan; Google cancela cuentas por eso. No coloques anuncios pegados al botón *Convertir a PDF*.
- Las palabras clave "convertir foto a pdf", "jpg a pdf" e "imagen a pdf" tienen mucha búsqueda. Puedes crear páginas como `jpg-a-pdf.html` o `png-a-pdf.html` que usen la misma herramienta con textos distintos.
