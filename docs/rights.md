# Rights: what publishing this repo would republish

This table covers `sources/raw/` (the fetched originals), `sources/text/`
(plain-text extracts of the same), and `sources/worksheets/` (extraction
worksheets built *from* the party PDFs, i.e. quote/paraphrase-heavy per-party
notes). It follows the `content-rights` skill's method: the required grant
is redistribution to the public, at zero cost, indefinitely, alongside an
MIT/CC-BY codebase — then each source kind's actual grant is read from the
artifact or its publisher's stated terms, not assumed from "it's on a
government website" or "it's a PDF someone downloaded".

**Requirement line:** we need the right to redistribute unmodified copies of
these files (raw + text) to the public, indefinitely, in a repo that may
also be used commercially by others under its MIT/CC BY licences. Non-commercial-only
terms are not sufficient; share-alike is not a concern (we are not
relicensing the source documents themselves, only citing them).

## 1. Public-sector documents

**Kind:** `lovdata-*` (Stortingets skattevedtak, folketrygdavgift, mva,
særavgifter, skatteloven kap. 4, endringslov), `prop1ls-2025-2026`,
`innst2s/3s/4l-2025-2026`, `ssb-*` (tables + FBU), `skatteetaten-*` (satser
pages), `nav-*`, `lanekassen-*`.

| Source | Publisher | Grant actually found | Read from |
|---|---|---|---|
| Lovdata statutes/forskrifter (`lovdata-skattevedtak-2026`, `lovdata-folketrygdavgift-2026`, `lovdata-mva-2026`, `lovdata-saeravgift-*`, `lovdata-skatteloven-kap4-2026`, `lovdata-endringslov-2026-06-23-66`) | Lovdata / Stortinget (delegated regulation) | **Public domain** in Norway: Åndsverkloven (2018 no. 40) §14 excludes "lover, forskrifter, rettsavgjørelser og andre vedtak av offentlig myndighet" from copyright altogether — a stronger position than a licence. Separately, Lovdata's own terms of use (`lovdata.no/info/vilkar`, §2.3) offer statutes and current central regulations under **NLOD 2.0** with attribution to Lovdata, but explicitly forbid *mass downloads and systematic extraction* of Lovdata's database/site as a whole. | Åndsverkloven §14 (statute text); Lovdata "Brukervilkår for Lovdatas tjenester" §2.3 (`lovdata.no/info/vilkar`) |
| Prop. 1 LS (2025–2026) | Finansdepartementet (regjeringen.no) | **Public domain**: §14 also covers "forslag, utredninger og andre uttalelser om spørsmål av offentlig interesse, når disse er avgitt av offentlig myndighet" — a Prop. is exactly this. | Åndsverkloven §14 |
| Innst. 2S/3S/4L (2025–2026) | Stortinget | **Public domain** under the same §14 clause (committee statements issued in the exercise of public authority). Stortinget's general terms of use (mediearkiv) restrict *photos/video*, not text documents, and don't apply here. | Åndsverkloven §14 |
| SSB tables (`ssb-06076`, `ssb-07459`, `ssb-09007`, `ssb-09654`, `ssb-fbu-14100`, `ssb-fbu-14156`) | Statistisk sentralbyrå | **CC BY 4.0**, current SSB-wide licence (superseded NLOD, which SSB states remains compatible). Permits redistribution, commercial use and derivatives with attribution to SSB. Confidential/personal data is carved out (not relevant here — these are aggregate tables). | `ssb.no/diverse/lisens` |
| Skatteetaten "satser" pages (`skatteetaten-trinnskatt-2026`, `-personfradrag-`, `-minstefradrag-`, `-trygdeavgift-`, `-formuesskatt-`, `-alminnelig-inntekt-`, `-arbeidsgiveravgift-`, `-merverdiavgift-`, `-forskuddsutskrivingen-`) | Skatteetaten | **No explicit reuse licence found** on skatteetaten.no. The *rates themselves* are facts drawn from the (copyright-free, §14) vedtak, so the numbers are not protected; but the page's own HTML/wording is Skatteetaten's, with no stated permission to republish it verbatim. Low risk for a small number of factual rate pages, but not a clean grant. | Skatteetaten site search (no dedicated terms-of-use/copyright page found for satser content); §14 for the underlying rates |
| NAV pages (`nav-barnetrygd-2026`, `nav-utvidet-barnetrygd-2026`, `nav-kontantstotte-2026`) | NAV | **No explicit reuse licence found.** These are administrative guidance pages (not themselves a "vedtak"), so §14 is less clearly applicable than for Lovdata/Prop./Innst. Treat as ordinary copyrighted text, reserved by default (silence = reserved, per the content-rights skill). | NAV site search (no terms-of-use/copyright page found) |
| Lånekassen pages (`lanekassen-endringer-2025-2026`, `lanekassen-satser-2026-2027`) | Lånekassen | **No explicit reuse licence found.** Same treatment as NAV: administrative announcement text, reserved by default. | Lånekassen site search (no terms-of-use/copyright page found) |

**What going public would republish:** the full raw HTML/PDF and full plain-text
extract of each of these documents, permanently, in repo history.

**Risk:** **Low** for the Lovdata/Prop./Innst./SSB rows — either statutorily
copyright-free (§14) or explicitly CC BY 4.0/NLOD. Lovdata's own "no mass
download" clause is a site-usage restriction on *how you got the file*, not a
redistribution ban on statute text that is independently public domain, but
it is worth noting if Lovdata ever objects to the retrieval method (`curl`,
per the manifest's `method` field) rather than the resulting file. **Low-to-medium**
for Skatteetaten/NAV/Lånekassen pages, where no explicit licence was found;
the underlying rates are free facts, but the page text/HTML itself is
technically reserved and there is no stated permission to mirror it.

## 2. Party alternative-budget documents

**Kind:** `h-alt-2026`, `frp-alt-2026`, `sv-alt-2026`, `sp-alt-2026`,
`krf-alt-2026`, `v-alt-2026`, `mdg-alt-2026`, `r-alt-2026` (PDF and, for Rødt,
also HTML) under `sources/raw/`, plus their plain-text extracts under
`sources/text/`.

| Source | Publisher | Grant actually found |
|---|---|---|
| All eight party alternative-budget PDFs/HTML | Høyre, Fremskrittspartiet, SV, Senterpartiet, KrF, Venstre, MDG, Rødt | **None found.** Political parties are not "offentlig myndighet" — Åndsverkloven §14 does not apply to them. No party site checked carries a stated Creative Commons or open licence on its budget document; ordinary copyright applies (reserved by default per the content-rights skill's rule that silence means reserved). Standard fair-dealing/quotation norms (§29 sitatrett) permit *quoting* short excerpts with attribution for commentary — which is what `src/data/parties/*.ts` and the worksheets do — but do not permit republishing the *whole document*. |

**What going public would republish:** the complete original PDF/HTML of
each party's multi-page alternative budget, verbatim, plus a complete
plain-text transcript of the same, permanently, in repo history (including
every prior commit, retrievable even if later deleted from HEAD).

**Risk:** **Medium-high.** This is the one part of `sources/` that isn't
resting on a public-domain or open-licence footing. It's a small practical
risk (parties generally want their budgets read and don't enforce copyright
against citation-heavy reuse), but it is a real one if a party objected: the
repo would be redistributing full copies of eight parties' copyrighted
documents with no licence, only the general §29 quotation right — and §29
does not cover full-document mirroring, whole-file PDF hosting, or a
verbatim `.txt` transcript of the entire document.

## 3. Derived text extracts and worksheets (this project's own output)

**Kind:** `sources/text/*.txt` (extraction of both public-sector and party
sources), `sources/worksheets/*.claude.md` / `*.codex.md` / `*.reconciled.md`,
`RECONCILIATION.md`, `baseline-2026.md`, `TEMPLATE.md`.

- The **text extracts of public-sector documents** carry the same status as
  their source (public domain / CC BY 4.0 / no-licence-found — see §1);
  they are mechanical OCR/text-layer extractions, adding no new
  copyrightable expression.
- The **text extracts of party PDFs** are the same problem as §2 in a
  different format: a full plain-text transcript of a party's copyrighted
  document is still a copy of that document, not a new work, so it carries
  the same medium-high risk as the PDF it was extracted from.
- The **worksheets** (`*.claude.md`, `*.codex.md`, `*.reconciled.md`, and
  `RECONCILIATION.md`/`baseline-2026.md`/`TEMPLATE.md`) are this project's
  own analysis — they extract specific figures with citations and reconcile
  two independent readings against each other. They are original work by
  this project and are covered by this repo's own CC BY 4.0 notice
  (`LICENSE-DATA.md`), **except** where a worksheet embeds a long verbatim
  quotation from a party PDF (a worksheet that quotes a full paragraph
  rather than paraphrasing carries some of the source document's risk for
  that quoted span specifically — worth a skim before going public, not
  redone here).

## Open decision for Jesper

`sources/` is left untouched by this lane — nothing has been removed, and
the decision on what ships in a public repo stays yours. The options, given
the above:

1. **Publish `sources/` as-is.** Lowest effort, carries the medium-high risk
   on the eight party PDFs/text extracts (§2) described above. Mitigating
   factor: `src/data/parties/*.ts` only cites specific figures with
   page/section pointers (`sourceId` + provenance), so the *product* doesn't
   depend on the raw files being public — only the audit trail does.
2. **Keep the party PDFs/HTML and their text extracts out of the public
   repo** (e.g. `sources/raw/{h,frp,sv,sp,krf,v,mdg,r}-alt-2026.*` and the
   matching `sources/text/*-alt-2026.txt`), publish everything else in
   `sources/` (Lovdata/Prop./Innst./SSB/Skatteetaten/NAV/Lånekassen +
   worksheets), and keep a private archive of the party originals for
   provenance/audit. Requires either `.gitignore`-ing those paths going
   forward (does not scrub git history — see option 3) or never having
   committed them publicly in the first place.
3. **Option 2, plus scrub history** if those files were already committed
   on a branch that will become the public history (`git filter-repo` or a
   fresh history at the public-switch point) — needed only if "keep them
   out" must also mean "were never publicly retrievable," not just "aren't
   in the current tree."
4. **Ask each party for a redistribution licence** before publishing (a
   short email; several may say yes, since wide readership of their
   alternative budget is generally in their interest) and publish once/if
   granted, keeping withheld ones under option 2 in the meantime.

None of these is executed by this lane. `sources/raw/*-alt-2026.*` and
`sources/text/*-alt-2026.txt` remain exactly where they were; only the four
files in this lane's ownership (`LICENSE`, `LICENSE-DATA.md`, `README.md`,
`docs/rights.md`, `docs/deploy.md`, `package.json`'s `license` field) were
touched.
