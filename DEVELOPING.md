# Developing this page

Static project page for *SkateNav: Learning Unified Adaptive Skating and Local Navigation
for Passive-Wheel Quadrupedal Robots*. No build step, no dependencies.

Published to <https://github.com/ktw1404/SkateNav> — this folder's contents become that
repository's root, so GitHub Pages serves `index.html` directly.

```
web/
├── index.html              the whole page
├── README.md               the repository landing page (shown on GitHub)
├── DEVELOPING.md           this file
├── css/style.css
├── js/main.js              nav highlighting, BibTeX copy, single-video playback
├── assets/img/             figures converted from pics/, plus video poster frames
└── assets/video/           deployment clips trimmed and re-encoded for the web
```

Total ≈ 28 MB (23 MB of it video).

## View locally

```sh
cd web && python3 -m http.server 8000
# open http://localhost:8000
```

## Publishing

`web/` is the single source of truth. Commit changes here, then push the folder's contents
to the public repository's root:

```sh
git subtree push --prefix web pages main
```

where `pages` is the remote `https://github.com/ktw1404/SkateNav.git`. Requires a working
github.com credential (`gh auth login -h github.com`).

## Placeholders to fill in before announcing

| Where | What |
|---|---|
| hero `.authors` | real author names (currently `Author One/Two/Three`) |
| hero `.venue` | venue and year |
| `README.md` + hero `.btn.todo` ×3 | paper, arXiv and code URLs — drop the `todo` class once linked. The manuscript PDF is deliberately **not** published here while the paper is under review |
| hero `.affil-logos` | replace the `.logo-slot` spans with real logo `<img>` tags |
| `#realworld .embed-slot` | replace with the YouTube `<iframe>` for the supplementary video |
| `#bibtex` | author list, booktitle, year |
| video captions | 7 `<!-- TODO: confirm site -->` comments — the site descriptions were inferred from the footage, not taken from the paper |

## Regenerating assets

Figures — `pdftocairo` (poppler) at 200 dpi. Line-art figures stay PNG; photographic and
rendered ones are converted to JPEG to keep the page light:

```sh
pdftocairo -png -r 200 -singlefile ../pics/overview/overview_v8.pdf assets/img/overview
ffmpeg -i assets/img/overview.png -q:v 3 assets/img/overview.jpg && rm assets/img/overview.png
```

Videos — trimmed to the window each clip is interesting in, scaled to 960 px wide, CRF 30,
audio dropped. The windows were chosen from the frame timestamps in
`pics/main_figure/.strip_work/`, i.e. where the paper's own figure strips were sampled:

| Source | Output | Window |
|---|---|---|
| `IMG_3411.MOV` | `real_indoor_glass.mp4` | 58 s + 20 s |
| `IMG_3413.MOV` | `real_indoor_cluttered.mp4` | 82 s + 18 s |
| `IMG_3380.MOV` | `real_indoor_lobby.mp4` | 10 s + 20 s |
| `IMG_3361.MOV` | `real_indoor_lab.mp4` | 28 s + 20 s |
| `IMG_3333.MOV` | `real_outdoor_road.mp4` | 19 s + 20 s |
| `IMG_3308.MOV` | `real_outdoor_lot.mp4` | 3 s + 20 s |
| `IMG_2526.MOV` | `real_outdoor_concrete.mp4` | 0 s + 15 s |
| `wheelnav_sim_zigzag3m_…mp4` | `sim_zigzag.mp4` | whole |

```sh
ffmpeg -nostdin -y -ss 82 -t 18 -i ../pics/main_figure/Media/IMG_3413.MOV \
       -vf scale=960:-2 -r 30 -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p \
       -movflags +faststart -an assets/video/real_indoor_cluttered.mp4

# poster frame from the middle of the trimmed clip
ffmpeg -nostdin -y -ss 9 -i assets/video/real_indoor_cluttered.mp4 -frames:v 1 \
       -q:v 4 assets/img/poster_real_indoor_cluttered.jpg
```

`-nostdin` matters: without it ffmpeg swallows the stdin of any surrounding shell loop.
