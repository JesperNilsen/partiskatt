#!/bin/zsh
set -u
REPO="/Users/jespernilsen/Claude programmer/partiskatt"
LOGD="$REPO/briefs/codex-s6"; mkdir -p "$LOGD"
cd "$REPO" || exit 1
run_party() {
  local p=$1 name=$2 pages=$3 n=$4
  local txt="sources/text/${p}-alt-2026.txt"
  local prompt="Task: blind extraction for the Partiskatt project (a calculator of household tax under each Norwegian party's alternative 2026 budget). First read sources/worksheets/TEMPLATE.md in full; its 'Rules for filling this sheet' are binding. Your ONLY source is ${txt} (pdftotext -layout output of ${name}'s alternative state budget 2026; ${n} pages separated by form-feed characters). Use no other file, no web, and no memory of Norwegian politics for any number; if a value is not in that file, write NOT FOUND. Hint from the archive manifest: the party's main tax/duty summary table(s) are on page(s) ${pages}, where page = 1 + number of form feeds before the line (print a page with: awk 'BEGIN{RS=\"\\f\"} NR==<p>' ${txt}). Also search the file for: trinnskatt, innslagspunkt, personfradrag, minstefradrag, trygdeavgift, alminnelig inntekt, formuesskatt, bunnfradrag, verdsettelse, primærbolig, sekundærbolig, aksjer, fagforening, merverdiavgift, mva, matmoms, næringsmidler, elavgift, veibruksavgift, CO2-avgift, bensin, diesel, flypassasjeravgift, alkoholavgift, tobakksavgift, snus, barnetrygd, studiestøtte, basisstøtte, stipend, arbeidsgiveravgift, kontantstøtte. Fill every row of section A (all formula rows, adding trinnN sub-rows as the template says), then sections B, C and D. Parties state changes relative to the government's proposal (Prop. 1 LS 2025-2026): record the stated change verbatim, the baseline the party quotes if it quotes one, and the absolute value only when it can be derived from numbers in the document, otherwise write DERIVE. Every non-empty value needs a page and an anchor of at most 10 verbatim words containing the number; verify each anchor by grepping that page before using it. Your ENTIRE response must be the completed worksheet in markdown and nothing else: start with the line '# Ekstraksjonsark — ${name} alternativt statsbudsjett 2026', then 'Source: ${txt}', then 'Extractor: codex · Date: 2026-09-13', then sections A, B, C, D with the template's exact table columns. No preamble, no commentary after the sheet."
  ~/.claude/bin/delegate --to codex --mode consult --effort high --timeout 1500 --head 3 "$prompt" > "$LOGD/$p.log" 2>&1
  local rc=$?
  local out=$(grep -m1 '^full output: ' "$LOGD/$p.log" | sed 's/^full output: //')
  if [ -n "$out" ] && [ -f "$out" ] && grep -q '^# Ekstraksjonsark' "$out"; then
    awk '/^# Ekstraksjonsark/{f=1} /^===== delegate|^full output:/{f=0} f' "$out" > "sources/worksheets/$p.codex.md"
    echo "$p: OK rc=$rc lines=$(wc -l < sources/worksheets/$p.codex.md) from $out" >> "$LOGD/summary.txt"
  else
    echo "$p: FAILED rc=$rc out=${out:-none}" >> "$LOGD/summary.txt"
  fi
}
: > "$LOGD/summary.txt"
run_party h   "Høyre" "7, 17, 28" 31 &
run_party frp "Fremskrittspartiet" "46" 57 &
run_party sv  "Sosialistisk Venstreparti" "25, 37, 38" 40 &
run_party krf "Kristelig Folkeparti" "18" 45 &
wait
run_party sp  "Senterpartiet" "8" 91 &
run_party mdg "Miljøpartiet De Grønne" "7, 8" 85 &
run_party v   "Venstre" "85, 86, 87, 89, 91, 92, 94, 96, 98, 99, 101, 103, 104, 105, 106, 108, 112, 114, 116, 117" 140 &
run_party r   "Rødt" "30, 36" 64 &
wait
echo "ALL DONE $(date)" >> "$LOGD/summary.txt"
