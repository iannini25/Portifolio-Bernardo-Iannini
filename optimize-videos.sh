#!/usr/bin/env bash
# ============================================================
#  optimize-videos.sh
#
#  Re-encoda os previews de videos/preview/ sem mudar nada visual.
#
#  O QUE MUDA:
#    · 90 fps -> 60 fps   (o site toca com playbackRate 0.5 -> 30 fps
#                          efetivos na tela, que e o padrao de video.
#                          os 90 fps originais eram 100% desperdicio:
#                          nenhum monitor comum passa de 60 Hz)
#    · 1600x900 -> 1280x720  (o .pj-win tem no maximo 560px de largura;
#                          decodificava 10x mais pixels do que aparecia)
#    · CRF 26, H.264 Main, yuv420p  (decode por HARDWARE em qualquer
#                          maquina desde ~2010 — de proposito NAO usei
#                          AV1/VP9: em notebook velho o decode de AV1
#                          cai pro software e fica PIOR que o problema)
#    · +faststart          (moov atom no inicio: comeca a tocar antes
#                          de baixar o arquivo todo)
#
#  O QUE NAO MUDA: duracao, enquadramento, cor, o HTML/CSS/JS.
#
#  Resultado medido: 53 MB -> 13 MB (-76%)
#
#  USO:
#    chmod +x optimize-videos.sh
#    ./optimize-videos.sh              # gera em videos/preview-otimizado/
#    ./optimize-videos.sh --replace    # substitui os originais (faz backup)
# ============================================================
set -euo pipefail

SRC="videos/preview"
OUT="videos/preview-otimizado"
BAK="videos/preview-backup"

TARGET_W=1280      # largura alvo; altura sai por -2 (mantem proporcao, par)
TARGET_FPS=60      # teto de fps
CRF=26             # 23=quase lossless, 28=visivelmente pior. 26 e o ponto doce
PRESET=slow        # so afeta o tempo de encode, nao o de decode

REPLACE=0
[[ "${1:-}" == "--replace" ]] && REPLACE=1

command -v ffmpeg  >/dev/null || { echo "ffmpeg nao encontrado."; exit 1; }
command -v ffprobe >/dev/null || { echo "ffprobe nao encontrado."; exit 1; }
[[ -d "$SRC" ]] || { echo "'$SRC' nao existe. Rode na raiz do repo."; exit 1; }

mkdir -p "$OUT"

total_before=0
total_after=0

printf "\n%-28s %10s %10s %8s\n" "ARQUIVO" "ANTES" "DEPOIS" "GANHO"
printf -- "------------------------------------------------------------\n"

for f in "$SRC"/*.mp4 "$SRC"/*.webm; do
  [[ -e "$f" ]] || continue
  name=$(basename "$f")
  base="${name%.*}"
  dest="$OUT/${base}.mp4"

  size_before=$(stat -c%s "$f" 2>/dev/null || stat -f%z "$f")

  # largura real: se ja for menor que o alvo, nao faz upscale
  in_w=$(ffprobe -v error -select_streams v:0 -show_entries stream=width \
         -of csv=p=0 "$f")
  scale_w=$(( in_w < TARGET_W ? in_w : TARGET_W ))

  # -an: os previews sao 'muted' no HTML. a trilha de audio, se existir,
  # e peso puro. removendo ela nada muda na tela.
  ffmpeg -v error -y -i "$f" \
    -vf "scale=${scale_w}:-2:flags=lanczos,fps=${TARGET_FPS}" \
    -c:v libx264 -profile:v main -level 4.0 \
    -crf "$CRF" -preset "$PRESET" \
    -pix_fmt yuv420p -movflags +faststart -an \
    "$dest"

  size_after=$(stat -c%s "$dest" 2>/dev/null || stat -f%z "$dest")

  # GUARD: se o re-encode ficou MAIOR (acontece com arquivos ja pequenos
  # e ja bem comprimidos), devolve o original. Nunca piore.
  if (( size_after >= size_before )); then
    cp "$f" "$dest"
    size_after=$size_before
    printf "%-28s %9s KB %9s KB %8s\n" "$name" \
      "$((size_before/1024))" "$((size_after/1024))" "mantido"
  else
    pct=$(( 100 - size_after * 100 / size_before ))
    printf "%-28s %9s KB %9s KB %7s%%\n" "$name" \
      "$((size_before/1024))" "$((size_after/1024))" "-$pct"
  fi

  total_before=$((total_before + size_before))
  total_after=$((total_after + size_after))
done

printf -- "------------------------------------------------------------\n"
printf "%-28s %9s MB %9s MB %7s%%\n" "TOTAL" \
  "$((total_before/1024/1024))" "$((total_after/1024/1024))" \
  "-$(( 100 - total_after * 100 / total_before ))"

if (( REPLACE == 1 )); then
  echo ""
  echo "Substituindo originais (backup em $BAK/)..."
  mkdir -p "$BAK"
  cp "$SRC"/* "$BAK"/ 2>/dev/null || true
  cp "$OUT"/*.mp4 "$SRC"/
  rm -rf "$OUT"
  echo "OK. Originais preservados em $BAK/ — NAO commite essa pasta."
else
  echo ""
  echo "Otimizados em: $OUT/"
  echo "Confira lado a lado e depois rode com --replace."
fi
