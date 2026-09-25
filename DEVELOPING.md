# Developing this page

Static project page for *SkateNav: Learning Energy-Efficient Navigation through Adaptive
Skating on Passive-Wheel Quadrupedal Robots* (ICRA 2027 submission #6059). No build step, no
dependencies.

This folder is the git repository <https://github.com/ktw1404/SkateNav>; GitHub Pages serves
`index.html` from its root.

```
SkateNav/
├── index.html              the whole page
├── README.md               the repository landing page (shown on GitHub)
├── DEVELOPING.md           this file
├── css/style.css
├── js/main.js              nav highlighting, BibTeX copy, one video playing at a time
├── .gitignore              keeps .omc/ (local agent state) out of git
├── assets/img/             figures as SVG (vector) or 2x-resolution raster, plus posters
└── assets/video/           hero supplementary video + deployment clips re-encoded for the web
```

Total ≈ 44 MB (38 MB of it video; the hero video alone is 19 MB).

Page order follows the paper: title + tagline → hero video → authors/venue/buttons →
overview (two-sentence TL;DR, contributions, full abstract folded in `<details>`, Fig. 1) →
method (mechanical design as its first figure) → results (stat tiles, benchmarks, TABLE I,
analysis figures, ablations) → real world (route figure, 4 real-time clips, limitation) → BibTeX.

## View locally

```sh
cd SkateNav && python3 -m http.server 8000
# open http://localhost:8000
```

## Publishing

Commit here and push to `origin main`; GitHub Pages redeploys automatically. Requires a
working github.com credential (`gh auth login -h github.com`).

## Placeholders to fill in before announcing

| Where | What |
|---|---|
| hero `.venue` | currently "Under review (ICRA 2027 submission)" — update on acceptance |
| `README.md` + hero `.btn.todo` ×3 | paper, arXiv and code URLs — drop the `todo` class once linked. The manuscript PDF is deliberately **not** published here while the paper is under review |
| `#bibtex` | author list, booktitle, year |
| clip captions (`#realworld .vid-grid`) | the short site names were inferred from the footage, not taken from the paper — confirm |

## Regenerating assets

### Figures

The rule is set by what is inside the source PDF — check with
`pdfimages -list pics/<fig>.pdf`:

**Pure vector** (plots, diagrams — no embedded images) → **SVG**. Infinitely sharp at any
zoom, and `pdftocairo -svg` converts all text to glyph paths, so there is no font dependency
and no raster fallback:

```sh
pdftocairo -svg ../pics/adaptive_frequency_draft.pdf assets/img/learned_frequency.svg
```

| Figure | Source |
|---|---|
| `design_choice.svg` | `pics/method_desgin_choice_labeled_fixed.pdf` |
| `learned_frequency.svg` | `pics/adaptive_frequency_draft.pdf` |
| `temporal_allocation.svg` | `pics/group5_cycles_energy_distance.pdf` |
| `freq_sweep.svg` | `pics/flat_barnhard_uphill_1x3.pdf` |

**Photographic or heavily rasterized** → PNG at a dpi that lands the intrinsic width near
**2000 px**, i.e. 2× the ~972 px the page displays figures at. The dpi differs per figure
because the source page sizes differ wildly (237 pt to 1903 pt wide) — a fixed dpi is what
made the first pass blurry. Then JPEG at `-q:v 2` for the photo-heavy ones:

| Figure | Source | dpi | Result |
|---|---|---|---|
| `overview.jpg` | `pics/overview/overview_v6_reconstructed.pdf` | 370 | 2025×1414 px |
| `method_overview.png` | `pics/skatenav_main_figure_v11.pdf` | 130 | 2059×611 px |
| `skating_cycle.png` | `pics/skating_cycle_contact_mode.pdf` | 260 | 2951 px |
| `terrain.png` | `pics/Terrain.pdf` | 620 | 2041 px |
| `real_world_result.jpg` | `pics/Realworld/real_world_result_5.pdf` | 265 | 2006×1002 px |
| `mechanical_design.jpg` | `pics/Mechanical_Design_4.pdf` | 110 | 2908 px |

```sh
pdftocairo -png -r 370 -singlefile ../pics/overview/overview_v6_reconstructed.pdf assets/img/overview
ffmpeg -i assets/img/overview.png -q:v 2 assets/img/overview.jpg && rm assets/img/overview.png
```

`method_overview` is pure vector, but `pdftocairo -svg` produced a 7.5 MB SVG, so it is
published as PNG (kept as PNG, not JPEG, for the flat diagram colours and text). Paths are
relative to the paper's LaTeX source tree (latest submission).

`skating_cycle` is vector but embeds 4.7 Mpx of photos, so its SVG comes out at 4.6 MB —
raster is smaller there. Embedding the PDFs directly via `<object>`/`<embed>` was considered
and rejected: mobile Safari and Chrome for Android frequently refuse to render inline PDFs,
the browser viewer adds its own chrome, and the result does not reflow responsively. SVG
gives the same vector sharpness with none of that.

### Videos

**Hero video.** `assets/video/skatenav_supplementary.mp4` is the ICRA 2027 supplementary video
`ICRA27_6059_VI_i.mp4`, copied as-is (1280×720, 179.6 s, H.264 + AAC, faststart, 19 MB). Its
poster is the frame at 8 s (title card with the robot):

```sh
ffmpeg -nostdin -y -ss 8 -i assets/video/skatenav_supplementary.mp4 -frames:v 1 \
       -q:v 3 assets/img/poster_supplementary.jpg
```

**Deployment clips** — the page shows four of them in a visible row under Real World
(`real_indoor_glass`, `real_indoor_lobby`, `real_outdoor_road`, `real_outdoor_lot`, captioned
"1× speed" because the clips are only trimmed and scaled, never sped up); the other files,
audio dropped. The windows were chosen from the frame timestamps in
`pics/main_figure/.strip_work/`, i.e. where the paper's own figure strips were sampled:

| Source | Output | Window |
|---|---|---|
| `IMG_3380.MOV` | `real_indoor_lobby.mp4` | 10 s + 20 s |
| `IMG_3333.MOV` | `real_outdoor_road.mp4` | 19 s + 20 s |
| `IMG_3308.MOV` | `real_outdoor_lot.mp4` | 3 s + 20 s |

```sh
ffmpeg -nostdin -y -ss 82 -t 18 -i ../pics/main_figure/Media/IMG_3413.MOV \
       -vf scale=960:-2 -r 30 -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p \
       -movflags +faststart -an assets/video/real_indoor_cluttered.mp4

# poster frame from the middle of the trimmed clip
ffmpeg -nostdin -y -ss 9 -i assets/video/real_indoor_cluttered.mp4 -frames:v 1 \
       -q:v 4 assets/img/poster_real_indoor_cluttered.jpg
```

`-nostdin` matters: without it ffmpeg swallows the stdin of any surrounding shell loop.

### Skate mark and favicon

`assets/img/skate.svg` is the Twemoji roller skate (U+1F6FC), © Twitter/X, licensed CC-BY 4.0 (graphics attribution required if redistributed). `favicon.png` / `favicon-32.png` are rasterized from it with headless Chrome at 128 px, then downscaled.

### Clips cut from the supplementary video (Main_Original.mp4, 1920×1080 60 fps)

Cropped to the simulation panels where the source is a slide, kept at native crop size, 30 fps, CRF 23, audio dropped. The hero `skatenav_supplementary.mp4` is now `IMG_3380 2.MOV` (raw indoor run, 50.7 s) at 1080p, 30 fps, CRF 23, preceded by a 3 s title card: the first frame dimmed with `drawbox` black@0.6 and the paper title in white Liberation Sans. Total 53.8 s. The clips below still come from `Main_Original.mp4`.

| Output | Source window | Crop (source px) | Shown in |
|---|---|---|---|
| `real_indoor_uphill.mp4` | `IMG_3425.MOV` (original footage) 26 s + 14.5 s | none | Real World grid (replaces the glazed-corridor clip) |
| `sim_freq_terrain.mp4` | 155 s + 12.5 s | 1157×651 @ (380, 314) | Results › Adaptive skating frequency |
| `sim_freq_clearance.mp4` | 169 s + 3.5 s | 1157×651 @ (380, 314) | Results › Adaptive skating frequency |
| `abl_cycle_flat_{ours,wo}.mp4` | 125 s + 5.5 s | 767×282 @ (116 / 986, 702) — robot panel only | Results › ablation, side by side |
| `abl_cycle_uphill_{ours,wo}.mp4` | 132 s + 5.5 s | 767×282 @ (116 / 986, 702) | Results › ablation, side by side |
| `abl_freq_flat_{ours,wo}.mp4` | 140 s + 11.5 s | 767×282 @ (116 / 986, 702) | Results › ablation, side by side |
