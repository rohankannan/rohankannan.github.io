---
title: "How I solved Jane Street's July puzzle"
description: "Reconstructing a 3-D knight's walk from eleven scribbled numbers — a pixel ruler, one forced deduction, and a search that was over almost before it began."
pubDate: 2026-07-30
---

<style>
  .solvecard{background:#f3eddf;border:1px solid #e6decc;border-radius:6px;padding:18px 22px;margin:1.5rem 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:14px 20px}
  .stat-label{font-family:system-ui,-apple-system,sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#6f6759;margin-bottom:3px}
  .stat-value{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:18px;color:#26221b}
  .stat-value.big{font-size:25px;font-weight:700;color:#8a6400}
  figure.jsp{margin:2rem 0}
  figure.jsp svg{display:block;width:100%;height:auto;max-width:640px;margin:0 auto}
  figure.jsp.wide svg{max-width:100%}
  figure.jsp figcaption{font-size:.85rem;color:#6f6759;max-width:34rem;margin:.75rem auto 0;line-height:1.55;text-align:center}
  .tablewrap{overflow-x:auto;margin:1.6rem 0}
  .tablewrap table{border-collapse:collapse;margin:0 auto;font-size:.9rem}
  .tablewrap th{font-family:system-ui,sans-serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#6f6759;font-weight:600;text-align:left;padding:6px 16px 6px 0;border-bottom:1.5px solid #26221b}
  .tablewrap td{padding:6.5px 16px 6.5px 0;border-bottom:1px solid #e6decc;vertical-align:baseline}
  .tablewrap td.num,.tablewrap th.num{text-align:right}
  .tablewrap th.num{padding-right:16px}
  .tablewrap tr.total td{border-bottom:none;border-top:2px solid #26221b;font-weight:700}
  .jsp-aside{border-left:3px solid #eab41f;background:#f3eddf;padding:.85rem 1.25rem;margin:1.6rem 0;border-radius:0 6px 6px 0}
  .jsp-aside p{margin:.35rem 0}
  .bc{fill:#fffdf6;stroke:#e6decc;stroke-width:1}
  .bu{fill:#ece5d3;stroke:#e6decc;stroke-width:1}
  .bt{fill:#eab41f;opacity:.85}
  .bb{stroke:#26221b;stroke-width:5;stroke-linecap:square}
  .bframe{fill:none;stroke:#26221b;stroke-width:8}
  .bnum{font:700 33px ui-monospace,Menlo,monospace;fill:#26221b;text-anchor:middle}
  .bnumq{font:500 27px ui-monospace,Menlo,monospace;fill:#6f6759;text-anchor:middle;opacity:.65}
  .bnums{font:700 26px ui-monospace,Menlo,monospace;fill:#26221b;text-anchor:middle}
  .bval{font:500 21px ui-monospace,Menlo,monospace;fill:#4a4437;text-anchor:middle}
  .bmove{font:500 14px system-ui,sans-serif;fill:#6f6759;text-anchor:middle}
  .bop{font:700 30px ui-monospace,Menlo,monospace;fill:#b3372a;text-anchor:middle;paint-order:stroke;stroke:#faf6ee;stroke-width:8}
  .btow{font:600 13px system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;fill:#8a6400;text-anchor:middle}
  .ap{stroke:#35659c;stroke-width:2.4;opacity:.55}
  .aph{fill:#35659c;opacity:.8}
  .av{stroke:#b3372a;stroke-width:2.8;opacity:.8}
  .avh{fill:#b3372a}
  .fig-open .ap,.fig-open .av{stroke-width:4;opacity:.9}
</style>

'Pent-Up' Frustration 3 / Knight Moves 7 hands you an 8×8 board, thirteen invisible towers, and
eleven numbers a knight scribbled down on its way past. Reconstructing the walk took a pixel
ruler, one beautiful forced deduction, and a search that was over almost before it began.

<div class="solvecard"><div><div class="stat-label">Final answer</div><div class="stat-value big">33,609</div></div><div><div class="stat-label">Checkpoint interval</div><div class="stat-value">K = 7</div></div><div><div class="stat-label">Path</div><div class="stat-value">54 moves</div></div><div><div class="stat-label">Search</div><div class="stat-value">195,309 nodes</div></div><div><div class="stat-label">Solutions found</div><div class="stat-value">exactly 1</div></div></div>

## The puzzle

[Jane Street's July puzzle](https://www.janestreet.com/puzzles/) crosses two of their recurring
series. The board is tiled by the twelve pentominoes plus one 2×2 square, giving thirteen
regions. Each region is a slab one cube tall, and each must receive a **tower** — one extra cube
on a square of your choosing. A knight starts on the bottom-left square and makes knight's
moves — in *three dimensions*: every move travels 0 units along one axis, 1 along another, and 2
along the third, where the third axis is altitude. It never lands on the same square twice, and
it keeps going until it has stood on top of every tower.

The scoring rule is where the frustration lives. The knight starts at 0, and on its
N<sup>th</sup> move its score **increases by N** if it lands at the same altitude it left, is
**multiplied by N** if it moves up, and is **divided by N** if it moves down — a move that is
only legal when the score divides evenly.

Every three moves up to move #18, the knight wrote its score on the square where it landed.
After that it wrote only every K moves, for some unstated K > 3. The board shows the twelve
numbers it left behind (the 0 is the starting square):

<figure class="jsp wide">
<svg viewBox="-8 -8 816 816" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The puzzle board: 8 by 8 grid divided into 13 bold-outlined regions with 12 printed clue numbers">
<rect x="0" y="700" width="100" height="100" class="bc"/>
<rect x="0" y="600" width="100" height="100" class="bc"/>
<rect x="0" y="500" width="100" height="100" class="bc"/>
<rect x="0" y="400" width="100" height="100" class="bc"/>
<rect x="0" y="300" width="100" height="100" class="bc"/>
<rect x="0" y="200" width="100" height="100" class="bc"/>
<rect x="0" y="100" width="100" height="100" class="bc"/>
<rect x="0" y="0" width="100" height="100" class="bc"/>
<rect x="100" y="700" width="100" height="100" class="bc"/>
<rect x="100" y="600" width="100" height="100" class="bc"/>
<rect x="100" y="500" width="100" height="100" class="bc"/>
<rect x="100" y="400" width="100" height="100" class="bc"/>
<rect x="100" y="300" width="100" height="100" class="bc"/>
<rect x="100" y="200" width="100" height="100" class="bc"/>
<rect x="100" y="100" width="100" height="100" class="bc"/>
<rect x="100" y="0" width="100" height="100" class="bc"/>
<rect x="200" y="700" width="100" height="100" class="bc"/>
<rect x="200" y="600" width="100" height="100" class="bc"/>
<rect x="200" y="500" width="100" height="100" class="bc"/>
<rect x="200" y="400" width="100" height="100" class="bc"/>
<rect x="200" y="300" width="100" height="100" class="bc"/>
<rect x="200" y="200" width="100" height="100" class="bc"/>
<rect x="200" y="100" width="100" height="100" class="bc"/>
<rect x="200" y="0" width="100" height="100" class="bc"/>
<rect x="300" y="700" width="100" height="100" class="bc"/>
<rect x="300" y="600" width="100" height="100" class="bc"/>
<rect x="300" y="500" width="100" height="100" class="bc"/>
<rect x="300" y="400" width="100" height="100" class="bc"/>
<rect x="300" y="300" width="100" height="100" class="bc"/>
<rect x="300" y="200" width="100" height="100" class="bc"/>
<rect x="300" y="100" width="100" height="100" class="bc"/>
<rect x="300" y="0" width="100" height="100" class="bc"/>
<rect x="400" y="700" width="100" height="100" class="bc"/>
<rect x="400" y="600" width="100" height="100" class="bc"/>
<rect x="400" y="500" width="100" height="100" class="bc"/>
<rect x="400" y="400" width="100" height="100" class="bc"/>
<rect x="400" y="300" width="100" height="100" class="bc"/>
<rect x="400" y="200" width="100" height="100" class="bc"/>
<rect x="400" y="100" width="100" height="100" class="bc"/>
<rect x="400" y="0" width="100" height="100" class="bc"/>
<rect x="500" y="700" width="100" height="100" class="bc"/>
<rect x="500" y="600" width="100" height="100" class="bc"/>
<rect x="500" y="500" width="100" height="100" class="bc"/>
<rect x="500" y="400" width="100" height="100" class="bc"/>
<rect x="500" y="300" width="100" height="100" class="bc"/>
<rect x="500" y="200" width="100" height="100" class="bc"/>
<rect x="500" y="100" width="100" height="100" class="bc"/>
<rect x="500" y="0" width="100" height="100" class="bc"/>
<rect x="600" y="700" width="100" height="100" class="bc"/>
<rect x="600" y="600" width="100" height="100" class="bc"/>
<rect x="600" y="500" width="100" height="100" class="bc"/>
<rect x="600" y="400" width="100" height="100" class="bc"/>
<rect x="600" y="300" width="100" height="100" class="bc"/>
<rect x="600" y="200" width="100" height="100" class="bc"/>
<rect x="600" y="100" width="100" height="100" class="bc"/>
<rect x="600" y="0" width="100" height="100" class="bc"/>
<rect x="700" y="700" width="100" height="100" class="bc"/>
<rect x="700" y="600" width="100" height="100" class="bc"/>
<rect x="700" y="500" width="100" height="100" class="bc"/>
<rect x="700" y="400" width="100" height="100" class="bc"/>
<rect x="700" y="300" width="100" height="100" class="bc"/>
<rect x="700" y="200" width="100" height="100" class="bc"/>
<rect x="700" y="100" width="100" height="100" class="bc"/>
<rect x="700" y="0" width="100" height="100" class="bc"/>
<line x1="0" y1="700" x2="0" y2="800" class="bb"/>
<line x1="0" y1="700" x2="100" y2="700" class="bb"/>
<line x1="0" y1="600" x2="0" y2="700" class="bb"/>
<line x1="0" y1="500" x2="0" y2="600" class="bb"/>
<line x1="0" y1="400" x2="0" y2="500" class="bb"/>
<line x1="0" y1="300" x2="0" y2="400" class="bb"/>
<line x1="0" y1="300" x2="100" y2="300" class="bb"/>
<line x1="0" y1="200" x2="0" y2="300" class="bb"/>
<line x1="0" y1="100" x2="0" y2="200" class="bb"/>
<line x1="0" y1="100" x2="100" y2="100" class="bb"/>
<line x1="0" y1="0" x2="0" y2="100" class="bb"/>
<line x1="0" y1="0" x2="100" y2="0" class="bb"/>
<line x1="100" y1="600" x2="100" y2="700" class="bb"/>
<line x1="100" y1="500" x2="100" y2="600" class="bb"/>
<line x1="100" y1="500" x2="200" y2="500" class="bb"/>
<line x1="100" y1="400" x2="200" y2="400" class="bb"/>
<line x1="100" y1="300" x2="100" y2="400" class="bb"/>
<line x1="100" y1="200" x2="100" y2="300" class="bb"/>
<line x1="100" y1="200" x2="200" y2="200" class="bb"/>
<line x1="100" y1="100" x2="200" y2="100" class="bb"/>
<line x1="100" y1="0" x2="200" y2="0" class="bb"/>
<line x1="200" y1="700" x2="300" y2="700" class="bb"/>
<line x1="200" y1="600" x2="200" y2="700" class="bb"/>
<line x1="200" y1="600" x2="300" y2="600" class="bb"/>
<line x1="200" y1="500" x2="200" y2="600" class="bb"/>
<line x1="200" y1="400" x2="200" y2="500" class="bb"/>
<line x1="200" y1="300" x2="300" y2="300" class="bb"/>
<line x1="200" y1="200" x2="200" y2="300" class="bb"/>
<line x1="200" y1="100" x2="300" y2="100" class="bb"/>
<line x1="200" y1="0" x2="300" y2="0" class="bb"/>
<line x1="300" y1="700" x2="300" y2="800" class="bb"/>
<line x1="300" y1="500" x2="300" y2="600" class="bb"/>
<line x1="300" y1="500" x2="400" y2="500" class="bb"/>
<line x1="300" y1="400" x2="300" y2="500" class="bb"/>
<line x1="300" y1="300" x2="300" y2="400" class="bb"/>
<line x1="300" y1="300" x2="400" y2="300" class="bb"/>
<line x1="300" y1="200" x2="300" y2="300" class="bb"/>
<line x1="300" y1="100" x2="300" y2="200" class="bb"/>
<line x1="300" y1="100" x2="400" y2="100" class="bb"/>
<line x1="300" y1="0" x2="400" y2="0" class="bb"/>
<line x1="400" y1="700" x2="400" y2="800" class="bb"/>
<line x1="400" y1="700" x2="500" y2="700" class="bb"/>
<line x1="400" y1="600" x2="500" y2="600" class="bb"/>
<line x1="400" y1="500" x2="400" y2="600" class="bb"/>
<line x1="400" y1="500" x2="500" y2="500" class="bb"/>
<line x1="400" y1="300" x2="500" y2="300" class="bb"/>
<line x1="400" y1="100" x2="500" y2="100" class="bb"/>
<line x1="400" y1="0" x2="500" y2="0" class="bb"/>
<line x1="500" y1="600" x2="500" y2="700" class="bb"/>
<line x1="500" y1="600" x2="600" y2="600" class="bb"/>
<line x1="500" y1="400" x2="500" y2="500" class="bb"/>
<line x1="500" y1="300" x2="500" y2="400" class="bb"/>
<line x1="500" y1="300" x2="600" y2="300" class="bb"/>
<line x1="500" y1="200" x2="600" y2="200" class="bb"/>
<line x1="500" y1="100" x2="500" y2="200" class="bb"/>
<line x1="500" y1="100" x2="600" y2="100" class="bb"/>
<line x1="500" y1="0" x2="500" y2="100" class="bb"/>
<line x1="500" y1="0" x2="600" y2="0" class="bb"/>
<line x1="600" y1="700" x2="600" y2="800" class="bb"/>
<line x1="600" y1="700" x2="700" y2="700" class="bb"/>
<line x1="600" y1="500" x2="600" y2="600" class="bb"/>
<line x1="600" y1="500" x2="700" y2="500" class="bb"/>
<line x1="600" y1="400" x2="700" y2="400" class="bb"/>
<line x1="600" y1="300" x2="600" y2="400" class="bb"/>
<line x1="600" y1="200" x2="600" y2="300" class="bb"/>
<line x1="600" y1="100" x2="700" y2="100" class="bb"/>
<line x1="600" y1="0" x2="700" y2="0" class="bb"/>
<line x1="700" y1="600" x2="700" y2="700" class="bb"/>
<line x1="700" y1="500" x2="700" y2="600" class="bb"/>
<line x1="700" y1="400" x2="700" y2="500" class="bb"/>
<line x1="700" y1="400" x2="800" y2="400" class="bb"/>
<line x1="700" y1="300" x2="800" y2="300" class="bb"/>
<line x1="700" y1="200" x2="700" y2="300" class="bb"/>
<line x1="700" y1="100" x2="700" y2="200" class="bb"/>
<line x1="700" y1="0" x2="800" y2="0" class="bb"/>
<rect x="0" y="0" width="800" height="800" class="bframe"/>
<text x="550.0" y="61.0" class="bnum">37</text>
<text x="750.0" y="61.0" class="bnum">1100</text>
<text x="350.0" y="261.0" class="bnum">23</text>
<text x="550.0" y="261.0" class="bnum">138</text>
<text x="50.0" y="361.0" class="bnum">528</text>
<text x="150.0" y="461.0" class="bnum">449</text>
<text x="450.0" y="461.0" class="bnum">16</text>
<text x="150.0" y="561.0" class="bnum">750</text>
<text x="350.0" y="561.0" class="bnum">88</text>
<text x="550.0" y="561.0" class="bnum">272</text>
<text x="650.0" y="561.0" class="bnum">1</text>
<text x="50.0" y="761.0" class="bnum">0</text>
</svg>
<figcaption>The board as published: 13 bold-bordered regions — the twelve pentominoes plus a 2×2 — and the knight's graffiti. Bottom-left corner: the starting 0.</figcaption>
</figure>

The question isn't the path itself. Once you've reconstructed the walk and filled every visited
square with its score, you take each *unvisited* square, sum the scores on its orthogonal
neighbors that the knight did visit, and add those sums up. That total is the answer.

## Reading the board with a ruler

Rule one of a puzzle whose input is a picture: don't trust your eyes, measure. I wrote a small
script that walked every internal edge of the 855×855 image (the grid sits neatly at 45 + 95*i*
pixels) and measured the darkness band across each one. The histogram was perfectly bimodal —
every edge was either 2 pixels wide (plain grid) or 7 pixels wide (region border), with nothing
in between. Flood-filling with the thick edges as walls produced 13 regions.

Here the puzzle hands you a checksum for free: the tiling should be the twelve pentominoes, each
used once, plus a 2×2. My extracted regions were exactly that — F, I, L, N, P, T, U, V, W, X, Y,
Z, one of each. A single misread edge would have broken the multiset, so this one check retired
the biggest risk in the whole pipeline. The twelve printed numbers I cropped and read by eye
from a contact sheet: 0, 1, 16, 23, 37, 88, 138, 272, 449, 528, 750, 1100.

## What the rules actually pin down

Before searching, it pays to squeeze the model. Squares have altitude 1, towers altitude 2. A
move's displacement across (Δx, Δy, Δaltitude) must be a permutation of (0, 1, 2), which leaves
only two families:

- **Planar knight moves** — the usual (1,2) hop with altitude unchanged: both squares must be at
  the *same height*. Score +N.
- **Vertical slides** — two squares straight in any direction, altitude changing by exactly 1:
  one endpoint is a tower, the other isn't. Score ×N going up, ÷N coming down.

An altitude change of 2 is impossible when heights only span 1–2, so those are all the moves
there are. Two consequences do a lot of work later. First, *ups and downs strictly alternate* —
you can't multiply twice without dividing in between, because after going up you're on a tower
and the only vertical move left is down. Second, the score is always a nonnegative integer, and
0 divides evenly by everything.

The bookkeeping constraint is lovely: eleven numbers, six of them from the writes at moves 3, 6,
9, 12, 15, 18 — so exactly **five** writes happened afterwards, at moves 18+K, 18+2K, …, 18+5K.
The path can't exceed 63 moves (64 squares), so 18 + 5K ≤ 63, boxing K into 4…9. And since the
knight stops the instant it has visited all thirteen towers, the final square of the walk must
itself be a tower.

## The gift: a forced opening

Here is the deduction that cracks the puzzle open. Enumerate every score a knight can have after
three moves. Starting from 0, running all 27 op-sequences and discarding illegal divisions
leaves a six-element set: **{0, 1, 3, 5, 6, 9}**. The write at move #3 must land on a printed
number. Two printed values sit in that set — but the 0 is on the starting square, which the
knight can never revisit. That leaves the **1**, sitting on g3.

Better still, there is exactly one arithmetic route to 1: 0 + 1 = 1, 1 + 2 = 3, 3 ÷ 3 = 1. The
division means move #3 was a *down* move — the knight stepped off a tower onto g3. And the two
additions before it were same-altitude moves, which chains the equality all the way back: the
starting square and both intermediate squares are all at altitude 2. **All three are towers.**

Geometry finishes the job. A down-slide into g3 comes from e3, g1, or g5; of those, only e3 is a
knight's move from a square that is itself a knight's move from a1 — namely c2. Before writing a
single line of search code, the opening is forced:

<figure class="jsp wide fig-open">
<svg viewBox="-8 392 816 416" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The forced opening: knight moves from a1 to c2 to e3 to g3, scoring plus 1, plus 2, divide by 3">
<rect x="0" y="700" width="100" height="100" class="bc"/>
<rect x="7" y="707" width="86" height="86" class="bt"/>
<rect x="0" y="600" width="100" height="100" class="bc"/>
<rect x="0" y="500" width="100" height="100" class="bc"/>
<rect x="0" y="400" width="100" height="100" class="bc"/>
<rect x="100" y="700" width="100" height="100" class="bc"/>
<rect x="100" y="600" width="100" height="100" class="bc"/>
<rect x="100" y="500" width="100" height="100" class="bc"/>
<rect x="100" y="400" width="100" height="100" class="bc"/>
<rect x="200" y="700" width="100" height="100" class="bc"/>
<rect x="200" y="600" width="100" height="100" class="bc"/>
<rect x="207" y="607" width="86" height="86" class="bt"/>
<rect x="200" y="500" width="100" height="100" class="bc"/>
<rect x="200" y="400" width="100" height="100" class="bc"/>
<rect x="300" y="700" width="100" height="100" class="bc"/>
<rect x="300" y="600" width="100" height="100" class="bc"/>
<rect x="300" y="500" width="100" height="100" class="bc"/>
<rect x="300" y="400" width="100" height="100" class="bc"/>
<rect x="400" y="700" width="100" height="100" class="bc"/>
<rect x="400" y="600" width="100" height="100" class="bc"/>
<rect x="400" y="500" width="100" height="100" class="bc"/>
<rect x="407" y="507" width="86" height="86" class="bt"/>
<rect x="400" y="400" width="100" height="100" class="bc"/>
<rect x="500" y="700" width="100" height="100" class="bc"/>
<rect x="500" y="600" width="100" height="100" class="bc"/>
<rect x="500" y="500" width="100" height="100" class="bc"/>
<rect x="500" y="400" width="100" height="100" class="bc"/>
<rect x="600" y="700" width="100" height="100" class="bc"/>
<rect x="600" y="600" width="100" height="100" class="bc"/>
<rect x="600" y="500" width="100" height="100" class="bc"/>
<rect x="600" y="400" width="100" height="100" class="bc"/>
<rect x="700" y="700" width="100" height="100" class="bc"/>
<rect x="700" y="600" width="100" height="100" class="bc"/>
<rect x="700" y="500" width="100" height="100" class="bc"/>
<rect x="700" y="400" width="100" height="100" class="bc"/>
<line x1="0" y1="700" x2="0" y2="800" class="bb"/>
<line x1="0" y1="700" x2="100" y2="700" class="bb"/>
<line x1="0" y1="600" x2="0" y2="700" class="bb"/>
<line x1="0" y1="500" x2="0" y2="600" class="bb"/>
<line x1="0" y1="400" x2="0" y2="500" class="bb"/>
<line x1="0" y1="400" x2="100" y2="400" class="bb"/>
<line x1="100" y1="600" x2="100" y2="700" class="bb"/>
<line x1="100" y1="500" x2="100" y2="600" class="bb"/>
<line x1="100" y1="500" x2="200" y2="500" class="bb"/>
<line x1="100" y1="400" x2="200" y2="400" class="bb"/>
<line x1="200" y1="700" x2="300" y2="700" class="bb"/>
<line x1="200" y1="600" x2="200" y2="700" class="bb"/>
<line x1="200" y1="600" x2="300" y2="600" class="bb"/>
<line x1="200" y1="500" x2="200" y2="600" class="bb"/>
<line x1="200" y1="400" x2="200" y2="500" class="bb"/>
<line x1="200" y1="400" x2="300" y2="400" class="bb"/>
<line x1="300" y1="700" x2="300" y2="800" class="bb"/>
<line x1="300" y1="500" x2="300" y2="600" class="bb"/>
<line x1="300" y1="500" x2="400" y2="500" class="bb"/>
<line x1="300" y1="400" x2="300" y2="500" class="bb"/>
<line x1="300" y1="400" x2="400" y2="400" class="bb"/>
<line x1="400" y1="700" x2="400" y2="800" class="bb"/>
<line x1="400" y1="700" x2="500" y2="700" class="bb"/>
<line x1="400" y1="600" x2="500" y2="600" class="bb"/>
<line x1="400" y1="500" x2="400" y2="600" class="bb"/>
<line x1="400" y1="500" x2="500" y2="500" class="bb"/>
<line x1="400" y1="400" x2="500" y2="400" class="bb"/>
<line x1="500" y1="600" x2="500" y2="700" class="bb"/>
<line x1="500" y1="600" x2="600" y2="600" class="bb"/>
<line x1="500" y1="400" x2="500" y2="500" class="bb"/>
<line x1="500" y1="400" x2="600" y2="400" class="bb"/>
<line x1="600" y1="700" x2="600" y2="800" class="bb"/>
<line x1="600" y1="700" x2="700" y2="700" class="bb"/>
<line x1="600" y1="500" x2="600" y2="600" class="bb"/>
<line x1="600" y1="500" x2="700" y2="500" class="bb"/>
<line x1="600" y1="400" x2="700" y2="400" class="bb"/>
<line x1="700" y1="600" x2="700" y2="700" class="bb"/>
<line x1="700" y1="500" x2="700" y2="600" class="bb"/>
<line x1="700" y1="400" x2="700" y2="500" class="bb"/>
<line x1="700" y1="400" x2="800" y2="400" class="bb"/>
<rect x="0" y="400" width="800" height="400" class="bframe"/>
<text x="50.0" y="761.0" class="bnum">0</text>
<text x="250.0" y="661.0" class="bnum">1</text>
<text x="450.0" y="561.0" class="bnum">3</text>
<text x="650.0" y="561.0" class="bnum">1</text>
<text x="150.0" y="461.0" class="bnumq">449</text>
<text x="450.0" y="461.0" class="bnumq">16</text>
<text x="150.0" y="561.0" class="bnumq">750</text>
<text x="350.0" y="561.0" class="bnumq">88</text>
<text x="550.0" y="561.0" class="bnumq">272</text>
<line x1="50.0" y1="750.0" x2="250.0" y2="650.0" class="ap"/><polygon points="243.7,653.1 237.3,662.5 232.3,652.7" class="aph"/>
<text x="164.0" y="688.0" class="bop">+1</text>
<line x1="250.0" y1="650.0" x2="450.0" y2="550.0" class="ap"/><polygon points="443.7,553.1 437.3,562.5 432.3,552.7" class="aph"/>
<text x="364.0" y="588.0" class="bop">+2</text>
<line x1="450.0" y1="550.0" x2="650.0" y2="550.0" class="av"/><polygon points="643.0,550.0 633.0,555.5 633.0,544.5" class="avh"/>
<text x="564.0" y="538.0" class="bop">&#247;3</text>
<text x="50.0" y="730" class="btow">tower</text>
<text x="250.0" y="630" class="btow">tower</text>
<text x="450.0" y="530" class="btow">tower</text>
</svg>
<figcaption>Moves 1–3 are forced: a1→c2→e3 along the tower tops, then down to g3 as the score goes 0 → 1 → 3 → 1. Three of the thirteen towers — in the T-, X-, and F-pentomino regions — are placed before the search even starts.</figcaption>
</figure>

## Teaching a computer to feel frustration

The naive decomposition — enumerate tower placements, then search for a path — is doomed:
4 · 5¹² ≈ 977 million placements before a single move is tried. The right shape is one
depth-first search over the *walk*, deciding lazily whether each newly visited square hosts its
region's tower. Height only ever matters on squares the knight actually touches; any region
whose tower the search hasn't placed on the path yet simply must still have a square available.

The printed numbers act as checkpoints, and nearly all the pruning power lives there:

- **Checkpoint feasibility.** At every node, sort the BFS distances to the still-unused printed
  squares; the i-th nearest must be reachable by the i-th remaining write time (a
  Hall's-condition-style relaxation). One clue out of reach kills the branch.
- **Arithmetic feasibility.** Between checkpoints there are at most K moves whose numbers are
  known. A tiny 3-way recursion (at most 3⁹ sequences, cut far earlier) asks: can *any* unused
  clue value even be produced from the current score in this gap? If not, prune.
- **Region feasibility.** Every towerless region still needs an unvisited square within reach of
  the remaining moves.
- **A score ceiling.** Ups and downs alternate, and within one checkpoint window the move
  numbers are consecutive — so each up/down pair multiplies the score by a factor close to 1,
  and a lone unpaired climb tops out at ×63. A score that strays more than a couple of orders of
  magnitude above the printed values can never get back to one by the next write, so capping it
  at 10⁸ discards nothing a real solution could do.

The result was almost anticlimactic. For K = 4, 5, 6, 8, and 9 the search dies after exactly 850
nodes — the checkpoint arithmetic can't survive past move 18. For K = 7 it explores 195,309
nodes and returns **exactly one solution**, in well under a second. No second path, no
alternative tower placement, nothing.

## The unique walk

<figure class="jsp wide">
<svg viewBox="-8 -8 816 816" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The full reconstructed solution: 54-move knight path with all scores, 13 towers, and 9 unvisited squares">
<rect x="0" y="700" width="100" height="100" class="bc"/>
<rect x="7" y="707" width="86" height="86" class="bt"/>
<rect x="0" y="600" width="100" height="100" class="bc"/>
<rect x="0" y="500" width="100" height="100" class="bc"/>
<rect x="0" y="400" width="100" height="100" class="bc"/>
<rect x="0" y="300" width="100" height="100" class="bc"/>
<rect x="7" y="307" width="86" height="86" class="bt"/>
<rect x="0" y="200" width="100" height="100" class="bc"/>
<rect x="0" y="100" width="100" height="100" class="bc"/>
<rect x="0" y="0" width="100" height="100" class="bu"/>
<rect x="100" y="700" width="100" height="100" class="bc"/>
<rect x="100" y="600" width="100" height="100" class="bc"/>
<rect x="100" y="500" width="100" height="100" class="bc"/>
<rect x="100" y="400" width="100" height="100" class="bc"/>
<rect x="100" y="300" width="100" height="100" class="bc"/>
<rect x="100" y="200" width="100" height="100" class="bu"/>
<rect x="100" y="100" width="100" height="100" class="bc"/>
<rect x="107" y="107" width="86" height="86" class="bt"/>
<rect x="100" y="0" width="100" height="100" class="bu"/>
<rect x="200" y="700" width="100" height="100" class="bc"/>
<rect x="200" y="600" width="100" height="100" class="bc"/>
<rect x="207" y="607" width="86" height="86" class="bt"/>
<rect x="200" y="500" width="100" height="100" class="bc"/>
<rect x="200" y="400" width="100" height="100" class="bc"/>
<rect x="207" y="407" width="86" height="86" class="bt"/>
<rect x="200" y="300" width="100" height="100" class="bc"/>
<rect x="200" y="200" width="100" height="100" class="bc"/>
<rect x="200" y="100" width="100" height="100" class="bc"/>
<rect x="200" y="0" width="100" height="100" class="bc"/>
<rect x="300" y="700" width="100" height="100" class="bu"/>
<rect x="300" y="600" width="100" height="100" class="bc"/>
<rect x="300" y="500" width="100" height="100" class="bc"/>
<rect x="300" y="400" width="100" height="100" class="bc"/>
<rect x="300" y="300" width="100" height="100" class="bc"/>
<rect x="300" y="200" width="100" height="100" class="bc"/>
<rect x="300" y="100" width="100" height="100" class="bc"/>
<rect x="300" y="0" width="100" height="100" class="bc"/>
<rect x="307" y="7" width="86" height="86" class="bt"/>
<rect x="400" y="700" width="100" height="100" class="bc"/>
<rect x="407" y="707" width="86" height="86" class="bt"/>
<rect x="400" y="600" width="100" height="100" class="bc"/>
<rect x="400" y="500" width="100" height="100" class="bc"/>
<rect x="407" y="507" width="86" height="86" class="bt"/>
<rect x="400" y="400" width="100" height="100" class="bc"/>
<rect x="400" y="300" width="100" height="100" class="bc"/>
<rect x="407" y="307" width="86" height="86" class="bt"/>
<rect x="400" y="200" width="100" height="100" class="bc"/>
<rect x="407" y="207" width="86" height="86" class="bt"/>
<rect x="400" y="100" width="100" height="100" class="bc"/>
<rect x="400" y="0" width="100" height="100" class="bc"/>
<rect x="500" y="700" width="100" height="100" class="bu"/>
<rect x="500" y="600" width="100" height="100" class="bc"/>
<rect x="500" y="500" width="100" height="100" class="bc"/>
<rect x="500" y="400" width="100" height="100" class="bc"/>
<rect x="500" y="300" width="100" height="100" class="bc"/>
<rect x="500" y="200" width="100" height="100" class="bc"/>
<rect x="500" y="100" width="100" height="100" class="bc"/>
<rect x="507" y="107" width="86" height="86" class="bt"/>
<rect x="500" y="0" width="100" height="100" class="bc"/>
<rect x="600" y="700" width="100" height="100" class="bc"/>
<rect x="600" y="600" width="100" height="100" class="bc"/>
<rect x="600" y="500" width="100" height="100" class="bc"/>
<rect x="600" y="400" width="100" height="100" class="bu"/>
<rect x="600" y="300" width="100" height="100" class="bu"/>
<rect x="600" y="200" width="100" height="100" class="bc"/>
<rect x="600" y="100" width="100" height="100" class="bc"/>
<rect x="600" y="0" width="100" height="100" class="bu"/>
<rect x="700" y="700" width="100" height="100" class="bc"/>
<rect x="700" y="600" width="100" height="100" class="bu"/>
<rect x="700" y="500" width="100" height="100" class="bc"/>
<rect x="707" y="507" width="86" height="86" class="bt"/>
<rect x="700" y="400" width="100" height="100" class="bc"/>
<rect x="700" y="300" width="100" height="100" class="bc"/>
<rect x="700" y="200" width="100" height="100" class="bc"/>
<rect x="707" y="207" width="86" height="86" class="bt"/>
<rect x="700" y="100" width="100" height="100" class="bc"/>
<rect x="700" y="0" width="100" height="100" class="bc"/>
<line x1="0" y1="700" x2="0" y2="800" class="bb"/>
<line x1="0" y1="700" x2="100" y2="700" class="bb"/>
<line x1="0" y1="600" x2="0" y2="700" class="bb"/>
<line x1="0" y1="500" x2="0" y2="600" class="bb"/>
<line x1="0" y1="400" x2="0" y2="500" class="bb"/>
<line x1="0" y1="300" x2="0" y2="400" class="bb"/>
<line x1="0" y1="300" x2="100" y2="300" class="bb"/>
<line x1="0" y1="200" x2="0" y2="300" class="bb"/>
<line x1="0" y1="100" x2="0" y2="200" class="bb"/>
<line x1="0" y1="100" x2="100" y2="100" class="bb"/>
<line x1="0" y1="0" x2="0" y2="100" class="bb"/>
<line x1="0" y1="0" x2="100" y2="0" class="bb"/>
<line x1="100" y1="600" x2="100" y2="700" class="bb"/>
<line x1="100" y1="500" x2="100" y2="600" class="bb"/>
<line x1="100" y1="500" x2="200" y2="500" class="bb"/>
<line x1="100" y1="400" x2="200" y2="400" class="bb"/>
<line x1="100" y1="300" x2="100" y2="400" class="bb"/>
<line x1="100" y1="200" x2="100" y2="300" class="bb"/>
<line x1="100" y1="200" x2="200" y2="200" class="bb"/>
<line x1="100" y1="100" x2="200" y2="100" class="bb"/>
<line x1="100" y1="0" x2="200" y2="0" class="bb"/>
<line x1="200" y1="700" x2="300" y2="700" class="bb"/>
<line x1="200" y1="600" x2="200" y2="700" class="bb"/>
<line x1="200" y1="600" x2="300" y2="600" class="bb"/>
<line x1="200" y1="500" x2="200" y2="600" class="bb"/>
<line x1="200" y1="400" x2="200" y2="500" class="bb"/>
<line x1="200" y1="300" x2="300" y2="300" class="bb"/>
<line x1="200" y1="200" x2="200" y2="300" class="bb"/>
<line x1="200" y1="100" x2="300" y2="100" class="bb"/>
<line x1="200" y1="0" x2="300" y2="0" class="bb"/>
<line x1="300" y1="700" x2="300" y2="800" class="bb"/>
<line x1="300" y1="500" x2="300" y2="600" class="bb"/>
<line x1="300" y1="500" x2="400" y2="500" class="bb"/>
<line x1="300" y1="400" x2="300" y2="500" class="bb"/>
<line x1="300" y1="300" x2="300" y2="400" class="bb"/>
<line x1="300" y1="300" x2="400" y2="300" class="bb"/>
<line x1="300" y1="200" x2="300" y2="300" class="bb"/>
<line x1="300" y1="100" x2="300" y2="200" class="bb"/>
<line x1="300" y1="100" x2="400" y2="100" class="bb"/>
<line x1="300" y1="0" x2="400" y2="0" class="bb"/>
<line x1="400" y1="700" x2="400" y2="800" class="bb"/>
<line x1="400" y1="700" x2="500" y2="700" class="bb"/>
<line x1="400" y1="600" x2="500" y2="600" class="bb"/>
<line x1="400" y1="500" x2="400" y2="600" class="bb"/>
<line x1="400" y1="500" x2="500" y2="500" class="bb"/>
<line x1="400" y1="300" x2="500" y2="300" class="bb"/>
<line x1="400" y1="100" x2="500" y2="100" class="bb"/>
<line x1="400" y1="0" x2="500" y2="0" class="bb"/>
<line x1="500" y1="600" x2="500" y2="700" class="bb"/>
<line x1="500" y1="600" x2="600" y2="600" class="bb"/>
<line x1="500" y1="400" x2="500" y2="500" class="bb"/>
<line x1="500" y1="300" x2="500" y2="400" class="bb"/>
<line x1="500" y1="300" x2="600" y2="300" class="bb"/>
<line x1="500" y1="200" x2="600" y2="200" class="bb"/>
<line x1="500" y1="100" x2="500" y2="200" class="bb"/>
<line x1="500" y1="100" x2="600" y2="100" class="bb"/>
<line x1="500" y1="0" x2="500" y2="100" class="bb"/>
<line x1="500" y1="0" x2="600" y2="0" class="bb"/>
<line x1="600" y1="700" x2="600" y2="800" class="bb"/>
<line x1="600" y1="700" x2="700" y2="700" class="bb"/>
<line x1="600" y1="500" x2="600" y2="600" class="bb"/>
<line x1="600" y1="500" x2="700" y2="500" class="bb"/>
<line x1="600" y1="400" x2="700" y2="400" class="bb"/>
<line x1="600" y1="300" x2="600" y2="400" class="bb"/>
<line x1="600" y1="200" x2="600" y2="300" class="bb"/>
<line x1="600" y1="100" x2="700" y2="100" class="bb"/>
<line x1="600" y1="0" x2="700" y2="0" class="bb"/>
<line x1="700" y1="600" x2="700" y2="700" class="bb"/>
<line x1="700" y1="500" x2="700" y2="600" class="bb"/>
<line x1="700" y1="400" x2="700" y2="500" class="bb"/>
<line x1="700" y1="400" x2="800" y2="400" class="bb"/>
<line x1="700" y1="300" x2="800" y2="300" class="bb"/>
<line x1="700" y1="200" x2="700" y2="300" class="bb"/>
<line x1="700" y1="100" x2="700" y2="200" class="bb"/>
<line x1="700" y1="0" x2="800" y2="0" class="bb"/>
<rect x="0" y="0" width="800" height="800" class="bframe"/>
<line x1="50.0" y1="750.0" x2="250.0" y2="650.0" class="ap"/><polygon points="243.7,653.1 237.3,662.5 232.3,652.7" class="aph"/>
<line x1="250.0" y1="650.0" x2="450.0" y2="550.0" class="ap"/><polygon points="443.7,553.1 437.3,562.5 432.3,552.7" class="aph"/>
<line x1="450.0" y1="550.0" x2="650.0" y2="550.0" class="av"/><polygon points="643.0,550.0 633.0,555.5 633.0,544.5" class="avh"/>
<line x1="650.0" y1="550.0" x2="750.0" y2="750.0" class="ap"/><polygon points="746.9,743.7 737.5,737.3 747.3,732.3" class="aph"/>
<line x1="750.0" y1="750.0" x2="550.0" y2="650.0" class="ap"/><polygon points="556.3,653.1 567.7,652.7 562.7,662.5" class="aph"/>
<line x1="550.0" y1="650.0" x2="450.0" y2="450.0" class="ap"/><polygon points="453.1,456.3 462.5,462.7 452.7,467.7" class="aph"/>
<line x1="450.0" y1="450.0" x2="450.0" y2="250.0" class="av"/><polygon points="450.0,257.0 455.5,267.0 444.5,267.0" class="avh"/>
<line x1="450.0" y1="250.0" x2="450.0" y2="50.0" class="av"/><polygon points="450.0,57.0 455.5,67.0 444.5,67.0" class="avh"/>
<line x1="450.0" y1="50.0" x2="350.0" y2="250.0" class="ap"/><polygon points="353.1,243.7 352.7,232.3 362.5,237.3" class="aph"/>
<line x1="350.0" y1="250.0" x2="250.0" y2="50.0" class="ap"/><polygon points="253.1,56.3 262.5,62.7 252.7,67.7" class="aph"/>
<line x1="250.0" y1="50.0" x2="50.0" y2="150.0" class="ap"/><polygon points="56.3,146.9 62.7,137.5 67.7,147.3" class="aph"/>
<line x1="50.0" y1="150.0" x2="50.0" y2="350.0" class="av"/><polygon points="50.0,343.0 44.5,333.0 55.5,333.0" class="avh"/>
<line x1="50.0" y1="350.0" x2="150.0" y2="150.0" class="ap"/><polygon points="146.9,156.3 147.3,167.7 137.5,162.7" class="aph"/>
<line x1="150.0" y1="150.0" x2="350.0" y2="50.0" class="ap"/><polygon points="343.7,53.1 337.3,62.5 332.3,52.7" class="aph"/>
<line x1="350.0" y1="50.0" x2="550.0" y2="50.0" class="av"/><polygon points="543.0,50.0 533.0,55.5 533.0,44.5" class="avh"/>
<line x1="550.0" y1="50.0" x2="350.0" y2="150.0" class="ap"/><polygon points="356.3,146.9 362.7,137.5 367.7,147.3" class="aph"/>
<line x1="350.0" y1="150.0" x2="250.0" y2="350.0" class="ap"/><polygon points="253.1,343.7 252.7,332.3 262.5,337.3" class="aph"/>
<line x1="250.0" y1="350.0" x2="350.0" y2="550.0" class="ap"/><polygon points="346.9,543.7 337.5,537.3 347.3,532.3" class="aph"/>
<line x1="350.0" y1="550.0" x2="150.0" y2="650.0" class="ap"/><polygon points="156.3,646.9 162.7,637.5 167.7,647.3" class="aph"/>
<line x1="150.0" y1="650.0" x2="50.0" y2="450.0" class="ap"/><polygon points="53.1,456.3 62.5,462.7 52.7,467.7" class="aph"/>
<line x1="50.0" y1="450.0" x2="250.0" y2="450.0" class="av"/><polygon points="243.0,450.0 233.0,455.5 233.0,444.5" class="avh"/>
<line x1="250.0" y1="450.0" x2="450.0" y2="350.0" class="ap"/><polygon points="443.7,353.1 437.3,362.5 432.3,352.7" class="aph"/>
<line x1="450.0" y1="350.0" x2="550.0" y2="150.0" class="ap"/><polygon points="546.9,156.3 547.3,167.7 537.5,162.7" class="aph"/>
<line x1="550.0" y1="150.0" x2="750.0" y2="150.0" class="av"/><polygon points="743.0,150.0 733.0,155.5 733.0,144.5" class="avh"/>
<line x1="750.0" y1="150.0" x2="550.0" y2="250.0" class="ap"/><polygon points="556.3,246.9 562.7,237.5 567.7,247.3" class="aph"/>
<line x1="550.0" y1="250.0" x2="350.0" y2="350.0" class="ap"/><polygon points="356.3,346.9 362.7,337.5 367.7,347.3" class="aph"/>
<line x1="350.0" y1="350.0" x2="250.0" y2="550.0" class="ap"/><polygon points="253.1,543.7 252.7,532.3 262.5,537.3" class="aph"/>
<line x1="250.0" y1="550.0" x2="50.0" y2="650.0" class="ap"/><polygon points="56.3,646.9 62.7,637.5 67.7,647.3" class="aph"/>
<line x1="50.0" y1="650.0" x2="250.0" y2="750.0" class="ap"/><polygon points="243.7,746.9 232.3,747.3 237.3,737.5" class="aph"/>
<line x1="250.0" y1="750.0" x2="450.0" y2="750.0" class="av"/><polygon points="443.0,750.0 433.0,755.5 433.0,744.5" class="avh"/>
<line x1="450.0" y1="750.0" x2="650.0" y2="750.0" class="av"/><polygon points="643.0,750.0 633.0,755.5 633.0,744.5" class="avh"/>
<line x1="650.0" y1="750.0" x2="550.0" y2="550.0" class="ap"/><polygon points="553.1,556.3 562.5,562.7 552.7,567.7" class="aph"/>
<line x1="550.0" y1="550.0" x2="750.0" y2="550.0" class="av"/><polygon points="743.0,550.0 733.0,555.5 733.0,544.5" class="avh"/>
<line x1="750.0" y1="550.0" x2="750.0" y2="350.0" class="av"/><polygon points="750.0,357.0 755.5,367.0 744.5,367.0" class="avh"/>
<line x1="750.0" y1="350.0" x2="650.0" y2="150.0" class="ap"/><polygon points="653.1,156.3 662.5,162.7 652.7,167.7" class="aph"/>
<line x1="650.0" y1="150.0" x2="550.0" y2="350.0" class="ap"/><polygon points="553.1,343.7 552.7,332.3 562.5,337.3" class="aph"/>
<line x1="550.0" y1="350.0" x2="450.0" y2="150.0" class="ap"/><polygon points="453.1,156.3 462.5,162.7 452.7,167.7" class="aph"/>
<line x1="450.0" y1="150.0" x2="250.0" y2="250.0" class="ap"/><polygon points="256.3,246.9 262.7,237.5 267.7,247.3" class="aph"/>
<line x1="250.0" y1="250.0" x2="150.0" y2="450.0" class="ap"/><polygon points="153.1,443.7 152.7,432.3 162.5,437.3" class="aph"/>
<line x1="150.0" y1="450.0" x2="50.0" y2="250.0" class="ap"/><polygon points="53.1,256.3 62.5,262.7 52.7,267.7" class="aph"/>
<line x1="50.0" y1="250.0" x2="250.0" y2="150.0" class="ap"/><polygon points="243.7,153.1 237.3,162.5 232.3,152.7" class="aph"/>
<line x1="250.0" y1="150.0" x2="150.0" y2="350.0" class="ap"/><polygon points="153.1,343.7 152.7,332.3 162.5,337.3" class="aph"/>
<line x1="150.0" y1="350.0" x2="50.0" y2="550.0" class="ap"/><polygon points="53.1,543.7 52.7,532.3 62.5,537.3" class="aph"/>
<line x1="50.0" y1="550.0" x2="150.0" y2="750.0" class="ap"/><polygon points="146.9,743.7 137.5,737.3 147.3,732.3" class="aph"/>
<line x1="150.0" y1="750.0" x2="350.0" y2="650.0" class="ap"/><polygon points="343.7,653.1 337.3,662.5 332.3,652.7" class="aph"/>
<line x1="350.0" y1="650.0" x2="150.0" y2="550.0" class="ap"/><polygon points="156.3,553.1 167.7,552.7 162.7,562.5" class="aph"/>
<line x1="150.0" y1="550.0" x2="350.0" y2="450.0" class="ap"/><polygon points="343.7,453.1 337.3,462.5 332.3,452.7" class="aph"/>
<line x1="350.0" y1="450.0" x2="450.0" y2="650.0" class="ap"/><polygon points="446.9,643.7 437.5,637.3 447.3,632.3" class="aph"/>
<line x1="450.0" y1="650.0" x2="550.0" y2="450.0" class="ap"/><polygon points="546.9,456.3 547.3,467.7 537.5,462.7" class="aph"/>
<line x1="550.0" y1="450.0" x2="650.0" y2="650.0" class="ap"/><polygon points="646.9,643.7 637.5,637.3 647.3,632.3" class="aph"/>
<line x1="650.0" y1="650.0" x2="750.0" y2="450.0" class="ap"/><polygon points="746.9,456.3 747.3,467.7 737.5,462.7" class="aph"/>
<line x1="750.0" y1="450.0" x2="650.0" y2="250.0" class="ap"/><polygon points="653.1,256.3 662.5,262.7 652.7,267.7" class="aph"/>
<line x1="650.0" y1="250.0" x2="750.0" y2="50.0" class="ap"/><polygon points="746.9,56.3 747.3,67.7 737.5,62.7" class="aph"/>
<line x1="750.0" y1="50.0" x2="750.0" y2="250.0" class="av"/><polygon points="750.0,243.0 744.5,233.0 755.5,233.0" class="avh"/>
<text x="450.0" y="740" class="bval">7440</text>
<text x="450.0" y="786" class="bmove">#30</text>
<text x="350.0" y="340" class="bval">164</text>
<text x="350.0" y="386" class="bmove">#26</text>
<text x="450.0" y="440" class="bnums">16</text>
<text x="450.0" y="486" class="bmove">#6</text>
<text x="350.0" y="640" class="bval">704</text>
<text x="350.0" y="686" class="bmove">#45</text>
<text x="350.0" y="40" class="bval">555</text>
<text x="350.0" y="86" class="bmove">#14</text>
<text x="550.0" y="340" class="bval">335</text>
<text x="550.0" y="386" class="bmove">#36</text>
<text x="450.0" y="140" class="bval">372</text>
<text x="450.0" y="186" class="bmove">#37</text>
<text x="550.0" y="640" class="bval">10</text>
<text x="550.0" y="686" class="bmove">#5</text>
<text x="550.0" y="40" class="bnums">37</text>
<text x="550.0" y="86" class="bmove">#15</text>
<text x="50.0" y="540" class="bval">615</text>
<text x="50.0" y="586" class="bmove">#43</text>
<text x="50.0" y="240" class="bval">489</text>
<text x="50.0" y="286" class="bmove">#40</text>
<text x="250.0" y="540" class="bval">191</text>
<text x="250.0" y="586" class="bmove">#27</text>
<text x="150.0" y="740" class="bval">659</text>
<text x="150.0" y="786" class="bmove">#44</text>
<text x="150.0" y="140" class="bval">541</text>
<text x="150.0" y="186" class="bmove">#13</text>
<text x="250.0" y="240" class="bval">410</text>
<text x="250.0" y="286" class="bmove">#38</text>
<text x="150.0" y="440" class="bnums">449</text>
<text x="150.0" y="486" class="bmove">#39</text>
<text x="750.0" y="340" class="bval">264</text>
<text x="750.0" y="386" class="bmove">#34</text>
<text x="650.0" y="540" class="bnums">1</text>
<text x="650.0" y="586" class="bmove">#3</text>
<text x="750.0" y="40" class="bnums">1100</text>
<text x="750.0" y="86" class="bmove">#53</text>
<text x="650.0" y="240" class="bval">1047</text>
<text x="650.0" y="286" class="bmove">#52</text>
<text x="450.0" y="540" class="bval">3</text>
<text x="450.0" y="586" class="bmove">#2</text>
<text x="450.0" y="240" class="bval">112</text>
<text x="450.0" y="286" class="bmove">#7</text>
<text x="350.0" y="440" class="bval">797</text>
<text x="350.0" y="486" class="bmove">#47</text>
<text x="550.0" y="140" class="bval">2712</text>
<text x="550.0" y="186" class="bmove">#23</text>
<text x="350.0" y="140" class="bval">53</text>
<text x="350.0" y="186" class="bmove">#16</text>
<text x="550.0" y="440" class="bval">894</text>
<text x="550.0" y="486" class="bmove">#49</text>
<text x="50.0" y="640" class="bval">219</text>
<text x="50.0" y="686" class="bmove">#28</text>
<text x="250.0" y="340" class="bval">70</text>
<text x="250.0" y="386" class="bmove">#17</text>
<text x="150.0" y="540" class="bnums">750</text>
<text x="150.0" y="586" class="bmove">#46</text>
<text x="50.0" y="340" class="bnums">528</text>
<text x="50.0" y="386" class="bmove">#12</text>
<text x="250.0" y="640" class="bval">1</text>
<text x="250.0" y="686" class="bmove">#1</text>
<text x="250.0" y="40" class="bval">33</text>
<text x="250.0" y="86" class="bmove">#10</text>
<text x="650.0" y="640" class="bval">944</text>
<text x="650.0" y="686" class="bmove">#50</text>
<text x="750.0" y="740" class="bval">5</text>
<text x="750.0" y="786" class="bmove">#4</text>
<text x="750.0" y="440" class="bval">995</text>
<text x="750.0" y="486" class="bmove">#51</text>
<text x="750.0" y="140" class="bval">113</text>
<text x="750.0" y="186" class="bmove">#24</text>
<text x="350.0" y="540" class="bnums">88</text>
<text x="350.0" y="586" class="bmove">#18</text>
<text x="450.0" y="640" class="bval">845</text>
<text x="450.0" y="686" class="bmove">#48</text>
<text x="450.0" y="40" class="bval">14</text>
<text x="450.0" y="86" class="bmove">#8</text>
<text x="350.0" y="240" class="bnums">23</text>
<text x="350.0" y="286" class="bmove">#9</text>
<text x="550.0" y="540" class="bnums">272</text>
<text x="550.0" y="586" class="bmove">#32</text>
<text x="450.0" y="340" class="bval">2689</text>
<text x="450.0" y="386" class="bmove">#22</text>
<text x="550.0" y="240" class="bnums">138</text>
<text x="550.0" y="286" class="bmove">#25</text>
<text x="50.0" y="740" class="bnums">0</text>
<text x="50.0" y="786" class="bmove">#0</text>
<text x="150.0" y="640" class="bval">107</text>
<text x="150.0" y="686" class="bmove">#19</text>
<text x="50.0" y="440" class="bval">127</text>
<text x="50.0" y="486" class="bmove">#20</text>
<text x="250.0" y="740" class="bval">248</text>
<text x="250.0" y="786" class="bmove">#29</text>
<text x="150.0" y="340" class="bval">572</text>
<text x="150.0" y="386" class="bmove">#42</text>
<text x="50.0" y="140" class="bval">44</text>
<text x="50.0" y="186" class="bmove">#11</text>
<text x="250.0" y="440" class="bval">2667</text>
<text x="250.0" y="486" class="bmove">#21</text>
<text x="250.0" y="140" class="bval">530</text>
<text x="250.0" y="186" class="bmove">#41</text>
<text x="750.0" y="540" class="bval">8976</text>
<text x="750.0" y="586" class="bmove">#33</text>
<text x="650.0" y="740" class="bval">240</text>
<text x="650.0" y="786" class="bmove">#31</text>
<text x="650.0" y="140" class="bval">299</text>
<text x="650.0" y="186" class="bmove">#35</text>
<text x="750.0" y="240" class="bval">59400</text>
<text x="750.0" y="286" class="bmove">#54</text>
</svg>
<figcaption>The full reconstruction: 54 moves, 55 squares. Gold squares are towers, grey squares were never visited. Blue segments are planar knight moves; red segments are vertical slides (multiply up, divide down). Bold values are the printed clues; #n gives the move number.</figcaption>
</figure>

The knight's eleven notes, in order:

<div class="tablewrap">
<table>
        <tr><th class="num">Move</th><th>Square</th><th class="num">Score</th><th>How it got there</th></tr>
        <tr><td class="num">3</td><td>g3</td><td class="num">1</td><td>(1 + 2) &divide; 3 &mdash; the forced opening</td></tr>
        <tr><td class="num">6</td><td>e4</td><td class="num">16</td><td>1+4 = 5, 5+5 = 10, 10+6 = 16: three straight additions</td></tr>
        <tr><td class="num">9</td><td>d6</td><td class="num">23</td><td>16 &times; 7 = 112, 112 &divide; 8 = 14, 14 + 9 = 23</td></tr>
        <tr><td class="num">12</td><td>a5</td><td class="num">528</td><td>&hellip;44 &times; 12 &mdash; a clue reached by multiplication</td></tr>
        <tr><td class="num">15</td><td>f8</td><td class="num">37</td><td>555 &divide; 15 &mdash; and one reached by division</td></tr>
        <tr><td class="num">18</td><td>d3</td><td class="num">88</td><td>additions across the middle ranks</td></tr>
        <tr><td class="num">25</td><td>f6</td><td class="num">138</td><td>after 2667 &rarr; 2689 &rarr; 2712, then &divide;24 = 113</td></tr>
        <tr><td class="num">32</td><td>f3</td><td class="num">272</td><td>after 248 &times; 30 = 7440, &divide; 31 = 240</td></tr>
        <tr><td class="num">39</td><td>b4</td><td class="num">449</td><td>after 272 &times; 33 = 8976, &divide; 34 = 264</td></tr>
        <tr><td class="num">46</td><td>b3</td><td class="num">750</td><td>a long quiet stretch of additions</td></tr>
        <tr><td class="num">53</td><td>h8</td><td class="num">1100</td><td>1047 + 53, into the corner</td></tr>
      </table>
</div>

Overall the walk breaks down as 42 additions, 6 multiplications, and 6 divisions, and every
multiplication but the final one is shadowed by a division a move or three later — the knight
climbs a tower, lets the score spike, then pays it back down. My favorite details are the
divisibility coincidences the setter engineered: the score is 248 when the knight climbs at move
30 precisely because 248 = 8 × 31, so the ×30 spike to 7,440 can come back down cleanly through
÷31. The 8,976 = 272 × 33 spike likewise lands exactly on a multiple of 34.

The ending is the flourish: the last written value, 1,100 on h8, then a climb off the corner —
1,100 × 54 = 59,400 — onto the tower at h6, the thirteenth and final one, and the knight stops
on the spot.

## The answer

Nine squares were never visited. For each, sum the scores on its visited orthogonal neighbors:

<div class="tablewrap">
<table>
        <tr><th>Unvisited square</th><th>Visited neighbors</th><th class="num">Sum</th></tr>
        <tr><td>a8</td><td>44</td><td class="num">44</td></tr>
        <tr><td>b8</td><td>33 + 541</td><td class="num">574</td></tr>
        <tr><td>g8</td><td>37 + 1100 + 299</td><td class="num">1,436</td></tr>
        <tr><td>b6</td><td>489 + 410 + 541 + 572</td><td class="num">2,012</td></tr>
        <tr><td>g5</td><td>335 + 264 + 1047</td><td class="num">1,646</td></tr>
        <tr><td>g4</td><td>894 + 995 + 1</td><td class="num">1,890</td></tr>
        <tr><td>h2</td><td>944 + 5 + 8976</td><td class="num">9,925</td></tr>
        <tr><td>d1</td><td>248 + 7440 + 704</td><td class="num">8,392</td></tr>
        <tr><td>f1</td><td>7440 + 240 + 10</td><td class="num">7,690</td></tr>
        <tr class="total"><td colspan="2">Answer</td><td class="num">33,609</td></tr>
      </table>
</div>

## Challenges and wrong turns

**Trusting pixels.** The scariest failure mode was never the search — it was feeding it a board
with one wrong edge and getting a confident, wrong, internally consistent answer. The pentomino
checksum caught that risk early, and I later re-extracted the board from scratch, with fresh
code, as an independent check.

**"Every K moves" is genuinely ambiguous.** Writes at 18+iK is the natural reading, but writes
at multiples of K (21, 28, … for K=7) is defensible, and so is reading "up until move #18"
exclusively, ending the early writes at 15. Rather than argue grammar, I ran the search under
all three readings. The two alternatives admit zero solutions for any K; the natural reading
admits exactly one. When one interpretation of an ambiguous sentence produces a unique solution
and the others produce none, you've found the setter's intent.

**Pruning without lying.** Every prune had to be a strict relaxation — a condition that no
genuine solution could fail — because the deliverable wasn't a solution but a proof of
uniqueness. The score cap was the one that needed an actual argument (the alternation lemma
above) rather than a shrug.

**Small rules with teeth.** Three subtleties would each have silently broken the search: the
knight stops immediately on the thirteenth tower, so the final square must be a tower; the
starting square may itself host its region's tower (and the unique solution requires it — a1 is
a tower); and 0 divides evenly by every N, so the score can idle at 0 through vertical moves.

## Alternative approaches

**By hand?** More viable than it looks, at least at first. The opening is forced with pencil and
paper, the early checkpoints are only three moves apart, and parity plus the clue geometry
constrain the midgame heavily. I suspect a patient human solver rides the checkpoints most of
the way and only sweats in the seven-move gaps. That's presumably the intended experience — the
computer just removes the "patient."

**Constraint programming / SAT.** You could encode position-per-move one-hots, altitude
variables, and the score recurrence, and let a CP solver prove uniqueness. The catch is the
score arithmetic: multiplication by move number with values in the tens of thousands makes for
ugly propagation. Bounded score domains would tame it, but the bespoke DFS with checkpoint
pruning is both simpler and certainly faster here.

**Meet-in-the-middle.** The checkpoint structure invites solving each clue-to-clue segment
independently — enumerate all (path fragment, score) pairs consistent with consecutive
checkpoints, then stitch fragments on compatible visited-sets and tower commitments. Overkill
for a search this small, but it's the right architecture if the gaps had been longer or the
board bigger.

**Towers first.** The tempting decomposition — guess all thirteen towers, then pathfind —
multiplies a billion-case outer loop by a hard inner problem. Deciding tower placement lazily
inside the path search is the entire ballgame; it turns tower choice from a combinatorial
explosion into a two-way branch at first visit.

## Verification

A solve like this is a pipeline of things that can each silently fail, so the answer got layered
checks: I wrote an independent verifier from scratch — exact rational arithmetic, every rule
re-tested — and then attacked my own answer from three more angles: re-extracting the board from
the pixels with fresh code, re-auditing every rule and my reading of the instructions, and
recomputing the final sum two structurally different ways. Everything agreed.

I solved this fully offline — no forums, no hints — and only after locking in 33,609 did I look
around. Two published community solutions, one in Java and one with a full write-up, report the
same K, the same final tower with the same 59,400, the same nine neighbor sums, and the same
total.

<div class="jsp-aside">
<p>What stays with me: the puzzle tells you its own first secret. Six possible scores after three moves, exactly one on the board, exactly one arithmetic route to it — and suddenly three towers are nailed down and the knight is four squares into its walk before you've made a single decision. Everything after that is just discipline: divisibility, checkpoints, and refusing to accept the first answer that looks right in place of the only answer that is.</p>
</div>

<p class="muted">Puzzle: Jane Street Puzzles — 'Pent-Up' Frustration 3 / Knight Moves 7, July 2026. Final answer <strong>33,609</strong>. Board coordinates in this post use chess notation: files a–h left to right, ranks 1–8 bottom to top; the knight starts on a1.</p>
