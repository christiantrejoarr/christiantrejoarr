const fs = require("fs");
const path = require("path");

const fontPath = path.join(__dirname, "..", "assets", "fonts", "PressStart2P-Regular.ttf");
const font = fs.existsSync(fontPath)
  ? fs.readFileSync(fontPath).toString("base64")
  : "";

const fontFace = font
  ? `<style>
    @font-face {
      font-family: "Press Start 2P";
      src: url("data:font/ttf;base64,${font}") format("truetype");
    }
    text { font-smooth: never; -webkit-font-smoothing: none; }
  </style>`
  : "";

function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderHeading(title) {
  const titleSize = 16;
  const titleX = 4;
  const titleY = 26;
  const titleW = title.length * 16 + 40;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${titleW}" height="36" viewBox="0 0 ${titleW} 36">
  <defs>
    ${fontFace}
  </defs>
  <text x="${titleX}" y="${titleY}" font-family="Press Start 2P, Courier New, monospace" font-size="${titleSize}" fill="#ffffff">${escapeXml(title)} <tspan fill="#ffffff">&#9608;<animate attributeName="opacity" values="1;0;1" dur="0.4s" repeatCount="indefinite"/></tspan></text>
</svg>
`;
}

const headings = [
  ["intro-title.svg", "FRONTEND DEVELOPER ANGULAR / REACT"],
  ["contact-title.svg", "WAYS TO REACH ME"],
  ["stack-title.svg", "LANGUAGES & FRAMEWORKS I CODE IN"],
  ["contributions-title.svg", "MY CONTRIBUTIONS"],
  ["stats-title.svg", "GITHUB ENGINEERING STATS"],
  ["analytics-title.svg", "CONTRIBUTION ANALYTICS"],
];

const lines = [
  "* Fake profile!!! I'm actually",
  "  Julian Casablancas the lead",
  "  singer of The Strokes and I",
  "  use this profile to upload",
  "  code.",
];

const fontSize = 16;
const charW = 16;
const lineH = 32;
const charDur = 0.045;
const pause = 1.6;
const boxX = 58;
const boxY = 20;
const boxW = 848;
const boxH = 228;
const textX = boxX + 36;
const textY = boxY + 66;

const glyphs = [];
let elapsed = 0;
lines.forEach((line, lineIndex) => {
  [...line].forEach((raw, column) => {
    glyphs.push({
      ch: raw === " " ? "\u00A0" : raw,
      x: textX + column * charW,
      y: textY + lineIndex * lineH,
      begin: elapsed,
    });
    elapsed += charDur;
  });
});

const total = elapsed + pause;

function opacityAnim(begin) {
  const hold = elapsed / total;
  if (begin <= 0) {
    return `<animate attributeName="opacity" values="1;1;0" keyTimes="0;${hold.toFixed(4)};1" calcMode="discrete" dur="${total.toFixed(3)}s" repeatCount="indefinite"/>`;
  }
  const appear = begin / total;
  return `<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;${appear.toFixed(4)};${hold.toFixed(4)};1" calcMode="discrete" dur="${total.toFixed(3)}s" repeatCount="indefinite"/>`;
}

const textNodes = glyphs
  .map(
    (glyph) =>
      `<text x="${glyph.x}" y="${glyph.y}" font-family="Press Start 2P, Courier New, monospace" font-size="${fontSize}" fill="#ffffff" opacity="${glyph.begin <= 0 ? 1 : 0}">${glyph.ch}${opacityAnim(glyph.begin)}</text>`
  )
  .join("\n  ");

const cursorTimes = [];
const cursorX = [];
const cursorY = [];
glyphs.forEach((glyph) => {
  cursorTimes.push((glyph.begin / total).toFixed(4));
  cursorX.push(String(glyph.x + charW));
  cursorY.push(String(glyph.y - 16));
});
cursorTimes.push("1");
cursorX.push(cursorX[cursorX.length - 1]);
cursorY.push(cursorY[cursorY.length - 1]);

const cy = boxY + 72;
const tipX = 6;
const half = 32;
const OUTER_BORDER = 6;
const INNER_BORDER = 3;

function bubblePath(x, y, w, h, tailTipX, tailHalf) {
  const n = (value) => Number(value.toFixed(3));
  return `M${n(x)},${n(y)}h${n(w)}v${n(h)}h${n(-w)}V${n(cy + tailHalf)}L${n(tailTipX)},${n(cy)}L${n(x)},${n(cy - tailHalf)}Z`;
}

function insetBubble(inset) {
  const width = boxX - tipX;
  const length = Math.hypot(width, half);
  const tipInset = (inset * length) / half;
  return {
    x: boxX + inset,
    y: boxY + inset,
    w: boxW - inset * 2,
    h: boxH - inset * 2,
    tipX: tipX + tipInset,
    half: (half / width) * (width + inset - tipInset),
  };
}

const outer = { x: boxX, y: boxY, w: boxW, h: boxH, tipX, half };
const fill = insetBubble(OUTER_BORDER);
const innerLine = insetBubble(OUTER_BORDER + INNER_BORDER);
const innerFill = insetBubble(OUTER_BORDER + INNER_BORDER * 2);

const bubbleSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="920" height="268" viewBox="0 0 920 268">
  <defs>
    ${fontFace}
  </defs>
  <path d="${bubblePath(outer.x, outer.y, outer.w, outer.h, outer.tipX, outer.half)}" fill="#ffffff"/>
  <path d="${bubblePath(fill.x, fill.y, fill.w, fill.h, fill.tipX, fill.half)}" fill="#000000"/>
  <path d="${bubblePath(innerLine.x, innerLine.y, innerLine.w, innerLine.h, innerLine.tipX, innerLine.half)}" fill="#ffffff"/>
  <path d="${bubblePath(innerFill.x, innerFill.y, innerFill.w, innerFill.h, innerFill.tipX, innerFill.half)}" fill="#000000"/>
  ${textNodes}
  <rect width="14" height="16" fill="#ffffff" x="${glyphs[0].x + charW}" y="${glyphs[0].y - 16}">
    <animate attributeName="x" values="${cursorX.join(";")}" keyTimes="${cursorTimes.join(";")}" calcMode="discrete" dur="${total.toFixed(3)}s" repeatCount="indefinite"/>
    <animate attributeName="y" values="${cursorY.join(";")}" keyTimes="${cursorTimes.join(";")}" calcMode="discrete" dur="${total.toFixed(3)}s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="1;0;1" dur="0.4s" repeatCount="indefinite"/>
  </rect>
</svg>
`;

const outDir = path.join(__dirname, "..", "assets");
for (const [file, heading] of headings) {
  fs.writeFileSync(path.join(outDir, file), renderHeading(heading));
  console.log(`listo ${file}`);
}
fs.writeFileSync(path.join(outDir, "intro-bubble.svg"), bubbleSvg);
console.log(`intro-bubble.svg listo (${total.toFixed(1)}s)`);
