const fs = require("fs");
const path = require("path");

const fontPath = path.join(__dirname, "..", "assets", "fonts", "PressStart2P-Regular.ttf");
const font = fs.existsSync(fontPath)
  ? fs.readFileSync(fontPath).toString("base64")
  : "";

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
const textX = 72;
const textY = 86;

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

const fontFace = font
  ? `<style>
    @font-face {
      font-family: "Press Start 2P";
      src: url("data:font/ttf;base64,${font}") format("truetype");
    }
    text { font-smooth: never; -webkit-font-smoothing: none; }
  </style>`
  : "";

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="920" height="268" viewBox="0 0 920 268">
  <defs>
    ${fontFace}
  </defs>
  <rect x="36" y="20" width="848" height="228" fill="#ffffff"/>
  <rect x="42" y="26" width="836" height="216" fill="#000000"/>
  <rect x="48" y="32" width="824" height="204" fill="none" stroke="#ffffff" stroke-width="3"/>
  ${textNodes}
  <rect width="14" height="16" fill="#ffffff" x="${glyphs[0].x + charW}" y="${glyphs[0].y - 16}">
    <animate attributeName="x" values="${cursorX.join(";")}" keyTimes="${cursorTimes.join(";")}" calcMode="discrete" dur="${total.toFixed(3)}s" repeatCount="indefinite"/>
    <animate attributeName="y" values="${cursorY.join(";")}" keyTimes="${cursorTimes.join(";")}" calcMode="discrete" dur="${total.toFixed(3)}s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="1;0;1" dur="0.4s" repeatCount="indefinite"/>
  </rect>
</svg>
`;

fs.writeFileSync(path.join(__dirname, "..", "assets", "intro-bubble.svg"), svg);
console.log(`intro-bubble.svg listo (${total.toFixed(1)}s)`);
