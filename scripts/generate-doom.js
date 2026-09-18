const fs = require("fs");
const path = require("path");

const USERNAME = "christiantrejoarr";
const SPRITE_DIR = path.join(__dirname, "..", "assets", "doom");
const SCALE = 2.5;
const WIDTH = 800;
const VIEW_H = 420;
const BAR_Y = 420;
const NUM_W = 13 * SCALE;
const NUM_H = 16 * SCALE;
const CYCLE = 5;

function uri(name) {
  const filePath = path.join(SPRITE_DIR, `${name}.png`);
  return `data:image/png;base64,${fs.readFileSync(filePath).toString("base64")}`;
}

function image(name, x, y, width, height, extra = "") {
  return `<image href="${uri(name)}" x="${x}" y="${y}" width="${width}" height="${height}"${extra}/>`;
}

function numberRow(value, rightX, y) {
  const glyphs = String(value).split("");
  let x = rightX - glyphs.length * NUM_W;
  return glyphs
    .map((digit) => {
      const node = image(`STTNUM${digit}`, x, y, NUM_W, NUM_H);
      x += NUM_W;
      return node;
    })
    .join("\n  ");
}

function percent(value, rightX, y) {
  return `${numberRow(value, rightX, y)}
  ${image("STTPRCNT", rightX, y, NUM_W, NUM_H)}`;
}

function discreteOpacity(windows, dur) {
  const samples = new Set([0, dur]);
  windows.forEach(([start, end]) => {
    samples.add(start);
    samples.add(end);
  });
  const times = [...samples].sort((a, b) => a - b);
  const values = times.map((time) =>
    windows.some(([start, end]) => time >= start && time < end) ? 1 : 0
  );
  const keyTimes = times.map((time) => (time / dur).toFixed(4)).join(";");
  return `<animate attributeName="opacity" values="${values.join(";")}" keyTimes="${keyTimes}" calcMode="discrete" dur="${dur}s" repeatCount="indefinite"/>`;
}

function pistolSprite(name, width, height) {
  const w = width * SCALE;
  const h = height * SCALE;
  const x = (WIDTH - w) / 2;
  const y = BAR_Y - h + 8;
  return { name, x, y, w, h };
}

const RUN_DUR = 0.4;
const OVERSCAN = 140;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function wallRunStrips({
  x0,
  x1,
  farX,
  fill,
  count = 24,
  farScale = 0.26,
  nearScale = 1.08,
}) {
  const width = x1 - x0;
  const step = width / count;
  const y0 = -OVERSCAN / farScale;
  const rectH = (VIEW_H + OVERSCAN * 2) / farScale;
  const chunks = [];
  for (let i = 0; i < count; i += 1) {
    const x = x0 + i * step;
    const mid = x + step / 2;
    const t = Math.min(1, Math.abs(mid - farX) / width);
    const sy = lerp(farScale, nearScale, t);
    chunks.push(
      `<g transform="scale(1 ${sy.toFixed(4)})"><rect x="${x.toFixed(2)}" y="${y0.toFixed(1)}" width="${(step + 1.6).toFixed(2)}" height="${rectH.toFixed(1)}" fill="${fill}"/></g>`
    );
  }
  return chunks.join("");
}

function floorRunStrips({
  y0,
  y1,
  fill,
  count = 24,
  farScale = 0.28,
  nearScale = 1.18,
}) {
  const height = y1 - y0;
  const step = height / count;
  const cx = WIDTH / 2;
  const chunks = [];
  for (let i = 0; i < count; i += 1) {
    const y = y0 + i * step;
    const sx = lerp(farScale, nearScale, (i + 0.5) / count);
    chunks.push(
      `<g transform="translate(${cx} 0) scale(${sx.toFixed(4)} 1) translate(${-cx} 0)"><rect x="${-WIDTH * 2}" y="${y.toFixed(2)}" width="${WIDTH * 5}" height="${(step + 1.6).toFixed(2)}" fill="${fill}"/></g>`
    );
  }
  return chunks.join("");
}

function phpHitFx(cycle) {
  const drops = [
    { x: 58, y: -36, rx: 14, ry: 8, rot: -32, fill: "#9b1111" },
    { x: -52, y: -28, rx: 12, ry: 7, rot: 26, fill: "#6e0909" },
    { x: 44, y: 48, rx: 11, ry: 7, rot: 20, fill: "#b31818" },
    { x: -48, y: 36, rx: 10, ry: 6, rot: -24, fill: "#5a0606" },
    { x: 18, y: -62, rx: 8, ry: 5, rot: 8, fill: "#c41e1e" },
    { x: -14, y: 58, rx: 8, ry: 5, rot: -10, fill: "#8a1010" },
    { x: 68, y: 10, rx: 7, ry: 4, rot: 42, fill: "#a01414" },
    { x: -66, y: -6, rx: 7, ry: 4, rot: -38, fill: "#4a0404" },
    { x: 32, y: -50, rx: 5, ry: 3.5, rot: -12, fill: "#d42828" },
    { x: -36, y: 50, rx: 5, ry: 3.5, rot: 16, fill: "#7c0c0c" },
    { x: 54, y: 30, rx: 4, ry: 3, rot: 30, fill: "#e03535" },
    { x: -22, y: -54, rx: 4, ry: 3, rot: -8, fill: "#3f0202" },
  ];
  const splats = drops
    .map(
      (drop) => `<g>
        <animateTransform attributeName="transform" type="translate" values="0 0; ${drop.x} ${drop.y}; ${drop.x * 1.35} ${drop.y * 1.4}" keyTimes="0;0.04;0.18" dur="${cycle}s" repeatCount="indefinite"/>
        <g transform="rotate(${drop.rot})">
          <ellipse rx="${drop.rx}" ry="${drop.ry}" fill="${drop.fill}" opacity="0">
            <animate attributeName="opacity" values="0;0.95;0.8;0;0" keyTimes="0;0.006;0.055;0.18;1" dur="${cycle}s" repeatCount="indefinite"/>
            <animateTransform attributeName="transform" type="scale" values="0.18; 1.25; 0.85" keyTimes="0;0.035;0.18" dur="${cycle}s" additive="sum" repeatCount="indefinite"/>
          </ellipse>
        </g>
      </g>`
    )
    .join("");
  return `<g>
      <ellipse rx="46" ry="32" fill="#7a0a0a" opacity="0">
        <animate attributeName="opacity" values="0;0.5;0.28;0;0" keyTimes="0;0.008;0.09;0.2;1" dur="${cycle}s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse rx="22" ry="16" fill="#c41e1e" opacity="0">
        <animate attributeName="opacity" values="0;0.7;0.2;0;0" keyTimes="0;0.006;0.04;0.12;1" dur="${cycle}s" repeatCount="indefinite"/>
      </ellipse>
      ${splats}
    </g>`;
}

async function fetchContributions() {
  const response = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=all`,
    { headers: { "User-Agent": "christiantrejoarr-doom-hud" } }
  );
  if (!response.ok) {
    throw new Error(`No pude leer contribuciones (${response.status})`);
  }
  const data = await response.json();
  const total = Object.values(data.total || {}).reduce(
    (sum, value) => sum + Number(value || 0),
    0
  );
  if (!Number.isFinite(total)) {
    throw new Error("El total de contribuciones no es valido");
  }
  return total;
}

function renderDoom(ammo) {
  const ammoY = 171 * SCALE;
  const faceX = 145 * SCALE;
  const faceY = 168 * SCALE;
  const faceW = 30 * SCALE;
  const faceH = 32 * SCALE;
  const armsX = 104 * SCALE;
  const idle = pistolSprite("PISGA0", 82, 92);
  const fire = pistolSprite("PISGB0", 82, 96);
  const cock = pistolSprite("PISGC0", 84, 100);
  const mid = pistolSprite("PISGD0", 84, 106);
  const reload = pistolSprite("PISGE0", 86, 120);
  const flashW = 32 * SCALE;
  const flashH = 30 * SCALE;
  const flashX = fire.x + (fire.w - flashW) / 2 - 18;
  const flashY = fire.y - flashH * 0.22;
  const phpW = 176;
  const phpH = 176;
  const wallL = 236;
  const wallR = 564;
  const horizon = 200;
  const skyPad = 96;

  const fireWin = [[0.0, 0.05]];
  const cockDown = [[0.05, 0.10]];
  const midDown = [[0.10, 0.14]];
  const reloadWin = [[0.14, 0.22]];
  const midUp = [[0.22, 0.26]];
  const cockUp = [[0.26, 0.30]];
  const idleWin = [[0.30, CYCLE]];

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="500" viewBox="0 0 ${WIDTH} 500" role="img" aria-label="Freedoom HUD with ${ammo} GitHub contributions as ammo">
  <!-- contributions: ${ammo} -->
  <defs>
    <pattern id="floor" patternUnits="userSpaceOnUse" width="160" height="160">
      <animateTransform attributeName="patternTransform" type="translate" values="0 0; 0 160" dur="${RUN_DUR}s" repeatCount="indefinite"/>
      ${image("FLOOR7_1", 0, 0, 160, 160)}
    </pattern>
    <pattern id="brickLeft" patternUnits="userSpaceOnUse" width="160" height="160">
      <animateTransform attributeName="patternTransform" type="translate" values="0 0; -160 0" dur="${RUN_DUR}s" repeatCount="indefinite"/>
      ${image("BROWN1", 0, 0, 160, 160)}
    </pattern>
    <pattern id="brickRight" patternUnits="userSpaceOnUse" width="160" height="160">
      <animateTransform attributeName="patternTransform" type="translate" values="0 0; 160 0" dur="${RUN_DUR}s" repeatCount="indefinite"/>
      ${image("BROWN1", 0, 0, 160, 160)}
    </pattern>
    <clipPath id="view">
      <rect width="${WIDTH}" height="${VIEW_H}"/>
    </clipPath>
    <clipPath id="clipFloor">
      <polygon points="-${OVERSCAN},${VIEW_H + OVERSCAN} 0,${VIEW_H} ${wallL},${horizon} ${wallR},${horizon} ${WIDTH},${VIEW_H} ${WIDTH + OVERSCAN},${VIEW_H + OVERSCAN}"/>
    </clipPath>
    <clipPath id="clipLeft">
      <polygon points="-${OVERSCAN},-${OVERSCAN} ${wallL},-${OVERSCAN} ${wallL},${horizon} 0,${VIEW_H} -${OVERSCAN},${VIEW_H + OVERSCAN}"/>
    </clipPath>
    <clipPath id="clipRight">
      <polygon points="${WIDTH + OVERSCAN},-${OVERSCAN} ${wallR},-${OVERSCAN} ${wallR},${horizon} ${WIDTH},${VIEW_H} ${WIDTH + OVERSCAN},${VIEW_H + OVERSCAN}"/>
    </clipPath>
  </defs>

  <rect width="${WIDTH}" height="500" fill="#000"/>

  <g clip-path="url(#view)">
    <g>
      <animateTransform attributeName="transform" type="translate" values="-7 2; 0 -3; 7 2; 0 -3; -7 2" keyTimes="0;0.25;0.5;0.75;1" calcMode="spline" keySplines="0.37 0 0.63 1; 0.37 0 0.63 1; 0.37 0 0.63 1; 0.37 0 0.63 1" dur="${RUN_DUR * 2}s" repeatCount="indefinite"/>
      ${image("SKY1", wallL - skyPad, -skyPad, wallR - wallL + skyPad * 2, horizon + skyPad * 1.5, ' preserveAspectRatio="xMidYMid slice"')}
    </g>
    <g>
      <animateTransform attributeName="transform" type="rotate" values="-2.4 ${WIDTH / 2} ${horizon}; 2.4 ${WIDTH / 2} ${horizon}; -2.4 ${WIDTH / 2} ${horizon}" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.37 0 0.63 1; 0.37 0 0.63 1" dur="${RUN_DUR * 2}s" repeatCount="indefinite"/>
      <g>
        <animateTransform attributeName="transform" type="translate" values="-5 10; 0 0; 5 10; 0 0; -5 10" keyTimes="0;0.25;0.5;0.75;1" calcMode="spline" keySplines="0.37 0 0.63 1; 0.37 0 0.63 1; 0.37 0 0.63 1; 0.37 0 0.63 1" dur="${RUN_DUR * 2}s" additive="sum" repeatCount="indefinite"/>
        <g clip-path="url(#clipFloor)">
          ${floorRunStrips({ y0: horizon, y1: VIEW_H + OVERSCAN, fill: "url(#floor)" })}
        </g>
        <g clip-path="url(#clipLeft)">
          ${wallRunStrips({ x0: -OVERSCAN, x1: wallL, farX: wallL, fill: "url(#brickLeft)" })}
        </g>
        <g clip-path="url(#clipRight)">
          ${wallRunStrips({ x0: wallR, x1: WIDTH + OVERSCAN, farX: wallR, fill: "url(#brickRight)" })}
        </g>
      </g>
    </g>
    <g>
      <animateTransform attributeName="transform" type="translate" values="400 152; 448 138; 418 176; 352 146; 400 152" dur="4.4s" repeatCount="indefinite"/>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="0; 12; -8; 6; 0" dur="4.4s" repeatCount="indefinite"/>
        <g>
          <animateTransform attributeName="transform" type="scale" values="1; 1.14; 0.88; 1.08; 1" dur="4.4s" additive="sum" repeatCount="indefinite"/>
          <g>
            <animateTransform attributeName="transform" type="translate" values="0 0; 12 -10; -8 6; 5 -3; 0 0; 0 0" keyTimes="0;0.006;0.016;0.03;0.07;1" dur="${CYCLE}s" additive="sum" repeatCount="indefinite"/>
            ${image("php", -phpW / 2, -phpH / 2, phpW, phpH, ' preserveAspectRatio="xMidYMid meet"')}
            ${phpHitFx(CYCLE)}
          </g>
        </g>
      </g>
    </g>
  </g>

  <g>
    <animateTransform attributeName="transform" type="translate" values="-18 14; 0 2; 18 14; 0 2; -18 14" keyTimes="0;0.25;0.5;0.75;1" calcMode="spline" keySplines="0.37 0 0.63 1; 0.37 0 0.63 1; 0.37 0 0.63 1; 0.37 0 0.63 1" dur="${RUN_DUR * 2.6}s" repeatCount="indefinite"/>
    <g>
      <animateTransform attributeName="transform" type="rotate" values="-2.6 ${WIDTH / 2} ${BAR_Y}; 0 ${WIDTH / 2} ${BAR_Y}; 2.6 ${WIDTH / 2} ${BAR_Y}; 0 ${WIDTH / 2} ${BAR_Y}; -2.6 ${WIDTH / 2} ${BAR_Y}" keyTimes="0;0.25;0.5;0.75;1" calcMode="spline" keySplines="0.37 0 0.63 1; 0.37 0 0.63 1; 0.37 0 0.63 1; 0.37 0 0.63 1" dur="${RUN_DUR * 2.6}s" additive="sum" repeatCount="indefinite"/>
      <g opacity="0">
        ${discreteOpacity(idleWin, CYCLE)}
        ${image(idle.name, idle.x, idle.y, idle.w, idle.h)}
      </g>
      <g>
        ${discreteOpacity(fireWin, CYCLE)}
        ${image("PISFA0", flashX, flashY, flashW, flashH)}
        ${image(fire.name, fire.x, fire.y, fire.w, fire.h)}
      </g>
      <g opacity="0">
        ${discreteOpacity([...cockDown, ...cockUp], CYCLE)}
        ${image(cock.name, cock.x, cock.y, cock.w, cock.h)}
      </g>
      <g opacity="0">
        ${discreteOpacity([...midDown, ...midUp], CYCLE)}
        ${image(mid.name, mid.x, mid.y, mid.w, mid.h)}
      </g>
      <g opacity="0">
        ${discreteOpacity(reloadWin, CYCLE)}
        ${image(reload.name, reload.x, reload.y, reload.w, reload.h)}
      </g>
    </g>
  </g>

  ${image("STBAR", 0, BAR_Y, WIDTH, 80)}
  ${image("STARMS", armsX, BAR_Y, 38 * SCALE, 32 * SCALE)}
  ${numberRow(ammo, 44 * SCALE, ammoY)}
  ${percent(99, 90 * SCALE, ammoY)}
  ${percent(100, 221 * SCALE, ammoY)}
  <g>
    <animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;0.28;0.33;0.66;0.71" dur="2.4s" repeatCount="indefinite"/>
    ${image("mugshot-00", faceX, faceY, faceW, faceH)}
  </g>
  <g opacity="0">
    <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.33;0.38;0.62;0.67" dur="2.4s" repeatCount="indefinite"/>
    ${image("mugshot-01", faceX, faceY, faceW, faceH)}
  </g>
  <g opacity="0">
    <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.67;0.72;0.95;1" dur="2.4s" repeatCount="indefinite"/>
    ${image("mugshot-02", faceX, faceY, faceW, faceH)}
  </g>
</svg>
`;
}

async function main() {
  const ammo = await fetchContributions();
  const outputPath = path.join(__dirname, "..", "assets", "doom-play.svg");
  fs.writeFileSync(outputPath, renderDoom(ammo), "utf8");
  console.log(`DOOM HUD actualizado con sprites de Freedoom: AMMO = ${ammo}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
