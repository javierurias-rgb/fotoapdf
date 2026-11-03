#!/usr/bin/env bash
# Uso: ./configurar.sh ca-pub-1234567890123456 midominio.com contacto@midominio.com
set -euo pipefail
if [ $# -lt 3 ]; then
  echo "Uso: $0 <ca-pub-ID> <dominio> <correo>"
  echo "Ej.: $0 ca-pub-1234567890123456 fotoapdf.com hola@fotoapdf.com"
  exit 1
fi
PUB="$1"; DOM="$2"; MAIL="$3"
[[ "$PUB" =~ ^ca-pub-[0-9]{16}$ ]] || { echo "El ID debe tener la forma ca-pub- seguido de 16 dígitos"; exit 1; }
NUM="${PUB#ca-}"   # pub-XXXXXXXXXXXXXXXX (formato de ads.txt)
cd "$(dirname "$0")"
for f in *.html ads.txt robots.txt sitemap.xml; do
  sed -i.bak \
    -e "s/ca-pub-XXXXXXXXXXXXXXXX/$PUB/g" \
    -e "s/pub-XXXXXXXXXXXXXXXX/$NUM/g" \
    -e "s/contacto@tudominio\.com/$MAIL/g" \
    -e "s/tudominio\.com/$DOM/g" "$f"
  rm -f "$f.bak"
done
echo "Listo: ID $PUB, dominio $DOM, correo $MAIL aplicados."
echo "Recuerda reemplazar los data-ad-slot de index.html (1111111111, 2222222222, 3333333333) por los de tus bloques de anuncios."
