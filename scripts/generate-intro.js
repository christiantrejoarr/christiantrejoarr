const fs = require("fs");
const path = require("path");

const photo = fs.readFileSync(path.join(__dirname, "..", "assets", "me.png")).toString("base64");

const lines = [
  "Fake profile!!! I'm actually Julian Casablancas",
  "the lead singer of The Strokes",
  "and I use this profile to upload code.",
];

const fontSize = 22;
const charW = 13.2;
const charDur = 0.07;
const pause = 1.2;
const gap = 0.2;
const y = 128;
const centerX = 480;

const total =
  lines.reduce((sum, line) => sum + line.length * charDur + pause + gap, 0);

function keyframes(pairs) {
  const cleaned = [];
  pairs.forEach(([time, value]) => {
    const key = Math.max(0, Math.min(1, time / total));
    const previous = cleaned[cleaned.length - 1];
    if (previous && Math.abs(previous.key - key) < 0.00015) {
      previous.value = value;
      return;
    }
    cleaned.push({ key, value });
  });
  if (cleaned[0].key !== 0) {
    cleaned.unshift({ key: 0, value: cleaned[0].value });
  }
  if (cleaned[cleaned.length - 1].key !== 1) {
    cleaned.push({ key: 1, value: cleaned[cleaned.length - 1].value });
  }
  return {
    keyTimes: cleaned.map((item) => item.key.toFixed(4)).join(";"),
    values: cleaned.map((item) => item.value).join(";"),
  };
}

const textNodes = [];
const cursorPairs = [];
let elapsed = 0;

lines.forEach((line) => {
  const glyphs = [...line];
  const lineStart = elapsed;

  glyphs.forEach((raw, index) => {
    const appear = lineStart + index * charDur;
    const hide = lineStart + glyphs.length * charDur + pause;
    const xPairs = [[0, centerX - charW / 2]];

    for (let visible = index + 1; visible <= glyphs.length; visible += 1) {
      const time = lineStart + (visible - 1) * charDur;
      const x = centerX - (visible * charW) / 2 + index * charW;
      xPairs.push([time, x.toFixed(1)]);
    }
    xPairs.push([hide, xPairs[xPairs.length - 1][1]]);
    xPairs.push([total, xPairs[xPairs.length - 1][1]]);

    const xAnim = keyframes(xPairs);
    const opacityPairs =
      appear <= 0
        ? [
            [0, 1],
            [hide, 1],
            [hide + 0.01, 0],
            [total, 0],
          ]
        : [
            [0, 0],
            [appear, 1],
            [hide, 1],
            [hide + 0.01, 0],
            [total, 0],
          ];
    const opacityAnim = keyframes(opacityPairs);
    const ch = raw === " " ? "\u00A0" : raw;

    textNodes.push(
      `<text x="${xPairs[1][1]}" y="${y}" font-family="Fira Code, Consolas, monospace" font-size="${fontSize}" fill="#F7B801" opacity="${appear <= 0 ? 1 : 0}">${ch}<animate attributeName="x" values="${xAnim.values}" keyTimes="${xAnim.keyTimes}" calcMode="discrete" dur="${total.toFixed(3)}s" repeatCount="indefinite"/><animate attributeName="opacity" values="${opacityAnim.values}" keyTimes="${opacityAnim.keyTimes}" calcMode="discrete" dur="${total.toFixed(3)}s" repeatCount="indefinite"/></text>`
    );
  });

  for (let visible = 1; visible <= glyphs.length; visible += 1) {
    cursorPairs.push([
      lineStart + (visible - 1) * charDur,
      (centerX + (visible * charW) / 2).toFixed(1),
    ]);
  }
  cursorPairs.push([
    lineStart + glyphs.length * charDur + pause,
    (centerX + (glyphs.length * charW) / 2).toFixed(1),
  ]);

  elapsed += glyphs.length * charDur + pause + gap;
});

cursorPairs.push([total, cursorPairs[cursorPairs.length - 1][1]]);
const cursorAnim = keyframes(cursorPairs);

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="920" height="500" viewBox="0 0 920 500">
  <path d="M112 22 H848 A42 42 0 0 1 890 64 V186 A42 42 0 0 1 848 228 H236 L108 278 L188 228 H112 A42 42 0 0 1 70 186 V64 A42 42 0 0 1 112 22 Z" fill="#e6e6e6" stroke="#222222" stroke-width="2.5" stroke-linejoin="round"/>
  ${textNodes.join("\n  ")}
  <rect width="12" height="24" fill="#F7B801" x="${cursorPairs[0][1]}" y="${y - 20}">
    <animate attributeName="x" values="${cursorAnim.values}" keyTimes="${cursorAnim.keyTimes}" calcMode="discrete" dur="${total.toFixed(3)}s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="1;0;1" dur="0.8s" repeatCount="indefinite"/>
  </rect>
  <image href="data:image/png;base64,${photo}" xlink:href="data:image/png;base64,${photo}" x="24" y="258" width="148" height="232" preserveAspectRatio="xMidYMid meet"/>
</svg>
`;

fs.writeFileSync(path.join(__dirname, "..", "assets", "intro-bubble.svg"), svg);
console.log(`intro-bubble.svg listo (${total.toFixed(1)}s)`);
