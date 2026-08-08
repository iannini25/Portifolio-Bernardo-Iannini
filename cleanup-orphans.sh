#!/usr/bin/env bash
# ============================================================
#  cleanup-orphans.sh
#
#  Acha e remove imagens que NAO sao referenciadas por nenhum
#  .html / .js / .css / .xml / .json / .md do repo.
#
#  Por padrao so LISTA. Confira antes de apagar.
#
#  USO:
#    ./cleanup-orphans.sh              # so lista (dry run)
#    ./cleanup-orphans.sh --delete     # apaga de verdade
#    ./cleanup-orphans.sh --og         # redimensiona o og:image
# ============================================================
set -euo pipefail

DELETE=0
DO_OG=0
for arg in "$@"; do
  [[ "$arg" == "--delete" ]] && DELETE=1
  [[ "$arg" == "--og" ]] && DO_OG=1
done

[[ -d img ]] || { echo "'img/' nao existe. Rode na raiz do repo."; exit 1; }

echo ""
echo "Procurando imagens sem referencia..."
echo ""

total=0
orphans=()

while IFS= read -r f; do
  b=$(basename "$f")
  # o || true e necessario: com pipefail, um grep sem match (status 1) no
  # PRIMEIRO orfao derrubaria o script inteiro via set -e
  refs=$(grep -rl --fixed-strings "$b" \
           --include='*.html' --include='*.js' --include='*.css' \
           --include='*.xml' --include='*.json' --include='*.md' \
           --include='*.txt' \
           . 2>/dev/null | grep -v '^\./\.git' | wc -l || true)

  size=$(stat -c%s "$f" 2>/dev/null || stat -f%z "$f")

  if [[ "$refs" -eq 0 ]]; then
    printf "  ORFAO   %-42s %6s KB\n" "$b" "$((size/1024))"
    orphans+=("$f")
    total=$((total + size))
  fi
done < <(find img -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' \))

echo ""
if [[ ${#orphans[@]} -eq 0 ]]; then
  echo "Nenhum orfao. Repo limpo."
else
  echo "Total recuperavel: $((total/1024)) KB (${#orphans[@]} arquivos)"
  echo ""
  if (( DELETE == 1 )); then
    for f in "${orphans[@]}"; do rm -f "$f"; done
    echo "Apagados. Se algum era usado por algo que o grep nao le,"
    echo "recupere com: git checkout -- img/"
  else
    echo "Dry run. Confira a lista acima e rode com --delete."
  fi
fi

# ── og:image ────────────────────────────────────────────────
# eufoto1.png (434 KB) NAO e orfao: e o og:image de 8 arquivos.
# LinkedIn/Twitter/WhatsApp so usam 1200x630.
if (( DO_OG == 1 )); then
  echo ""
  if [[ ! -f img/eufoto1.png ]]; then
    echo "img/eufoto1.png nao encontrado, pulando."
  elif ! command -v ffmpeg >/dev/null; then
    echo "ffmpeg nao encontrado — pulando o resize do og:image."
  else
    before=$(stat -c%s img/eufoto1.png 2>/dev/null || stat -f%z img/eufoto1.png)
    cp img/eufoto1.png img/eufoto1-original.png.bak
    ffmpeg -v error -y -i img/eufoto1-original.png.bak \
      -vf "scale=1200:630:force_original_aspect_ratio=increase:flags=lanczos,crop=1200:630" \
      -compression_level 9 img/eufoto1.png
    after=$(stat -c%s img/eufoto1.png 2>/dev/null || stat -f%z img/eufoto1.png)
    echo "og:image eufoto1.png: $((before/1024)) KB -> $((after/1024)) KB"
    echo "(backup: img/eufoto1-original.png.bak — apague depois de conferir)"
  fi
fi
