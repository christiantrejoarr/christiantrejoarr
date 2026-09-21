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
const BRICK_W = 72;
const BRICK_H = 220;

function uri(name) {
  const filePath = path.join(SPRITE_DIR, `${name}.png`);
  return `data:image/png;base64,${fs.readFileSync(filePath).toString("base64")}`;
}

const STACK_DIR = path.join(__dirname, "..", "assets", "stack");

function stackLogoUri(id) {
  const file = path.join(STACK_DIR, `${id}.svg`);
  const match = fs.readFileSync(file, "utf8").match(
    /href="(data:image\/svg\+xml;base64,[^"]+)"/
  );
  if (!match) {
    throw new Error(`No encontre el logo de ${id}`);
  }
  return match[1];
}

const HUD_PX = 2;

const HUD_DIGITS = {
  0: ["111", "101", "101", "101", "111"],
  1: ["010", "110", "010", "010", "111"],
  2: ["111", "001", "111", "100", "111"],
  3: ["111", "001", "111", "001", "111"],
  4: ["101", "101", "111", "001", "001"],
  5: ["111", "100", "111", "001", "111"],
  6: ["111", "100", "111", "101", "111"],
  7: ["111", "001", "001", "001", "001"],
  8: ["111", "101", "111", "101", "111"],
  9: ["111", "101", "111", "001", "111"],
  "/": ["001", "001", "010", "100", "100"],
  "%": ["101", "001", "010", "100", "101"],
};

const HUD_LETTERS = {
  A: ["010", "101", "111", "101", "101"],
  C: ["111", "100", "100", "100", "111"],
  E: ["111", "100", "111", "100", "111"],
  G: ["111", "100", "101", "101", "111"],
  J: ["001", "001", "001", "101", "111"],
  L: ["100", "100", "100", "100", "111"],
  N: ["101", "111", "111", "101", "101"],
  R: ["110", "101", "110", "101", "101"],
  S: ["111", "100", "111", "001", "111"],
  T: ["111", "010", "010", "010", "010"],
};

function hudGlyph(ch) {
  if (ch === " ") return ["000", "000", "000", "000", "000"];
  if (HUD_DIGITS[ch]) return HUD_DIGITS[ch];
  if (HUD_LETTERS[ch]) return HUD_LETTERS[ch];
  return ["000", "000", "000", "000", "000"];
}

function pixelGlyph(glyph, x, y, color) {
  const rects = [];
  glyph.forEach((row, rowIndex) => {
    [...row].forEach((bit, colIndex) => {
      if (bit !== "1") return;
      rects.push(
        `<rect x="${x + colIndex * HUD_PX}" y="${y + rowIndex * HUD_PX}" width="${HUD_PX}" height="${HUD_PX}" fill="${color}" shape-rendering="crispEdges"/>`
      );
    });
  });
  return rects.join("");
}

function pixelText(text, x, y, color) {
  let cursor = x;
  const parts = [];
  for (const ch of text) {
    const glyph = hudGlyph(ch);
    parts.push(pixelGlyph(glyph, cursor, y, color));
    cursor += (glyph[0].length + 1) * HUD_PX;
  }
  return { svg: parts.join(""), width: cursor - x };
}

function pixelTextRight(text, rightX, y, color) {
  let width = 0;
  for (const ch of text) {
    width += (hudGlyph(ch)[0].length + 1) * HUD_PX;
  }
  return pixelText(text, rightX - width + HUD_PX, y, color).svg;
}

function skillPanel() {
  const labelX = 278 * SCALE;
  const slashX = 294 * SCALE;
  const pctRight = 314 * SCALE;
  const row0 = BAR_Y + 6 * SCALE;
  const rowH = 6 * SCALE;
  const yellow = "#ffcc00";
  const gray = "#c6c6c6";
  const slash = "#8a8a8a";
  const skills = [
    { name: "ANGL", pct: 82 },
    { name: "REAC", pct: 76 },
    { name: "JS", pct: 78 },
    { name: "TS", pct: 84 },
  ];
  const rows = skills
    .map((skill, i) => {
      const y = row0 + i * rowH;
      return `<g>
      ${pixelText(skill.name.padEnd(4, " "), labelX, y, gray).svg}
      ${pixelGlyph(HUD_DIGITS["/"], slashX, y, slash)}
      ${pixelTextRight(`${skill.pct}%`, pctRight, y, yellow)}
    </g>`;
    })
    .join("\n    ");
  return `<g clip-path="url(#clipSkills)">
    ${rows}
  </g>
  `;
}

function armsLogos(armsX) {
  const slots = [
    { id: "html5", col: 0, row: 0 },
    { id: "sass", col: 1, row: 0 },
    { id: "typescript", col: 2, row: 0 },
    { id: "javascript", col: 0, row: 1 },
    { id: "angular", col: 1, row: 1 },
    { id: "react", col: 2, row: 1 },
  ];
  const originX = 3;
  const originY = 2;
  const gapX = 12;
  const gapY = 11;
  const slotW = 9 * SCALE;
  const slotH = 6.5 * SCALE;
  return slots
    .map((slot) => {
      const x = armsX + (originX + slot.col * gapX) * SCALE;
      const y = BAR_Y + (originY + slot.row * gapY + (slot.row === 0 ? 1.8 : 0)) * SCALE;
      return `<image href="${stackLogoUri(slot.id)}" x="${x}" y="${y}" width="${slotW}" height="${slotH}" preserveAspectRatio="xMidYMid meet"/>`;
    })
    .join("\n  ");
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
const FLOOR_DUR = 1.25;
const OVERSCAN = 140;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function wallRunStrips({
  x0,
  x1,
  farX,
  horizon,
  fill,
  count = 40,
  farScale = 0.28,
  nearScale = 1.18,
}) {
  const width = Math.abs(x1 - x0);
  const step = (x1 - x0) / count;
  const chunks = [];
  for (let i = 0; i < count; i += 1) {
    const x = x0 + i * step;
    const mid = x + step / 2;
    const t = Math.min(1, Math.abs(mid - farX) / width);
    const s = lerp(farScale, nearScale, t);
    const inv = 1 / s;
    const localX = farX + (x - farX) * inv;
    const localW = Math.abs(step) * inv + 4 * inv;
    const localY = horizon + (-OVERSCAN - horizon) * inv;
    const localH = (VIEW_H + OVERSCAN * 2) * inv;
    chunks.push(
      `<g transform="translate(${farX} ${horizon}) scale(${s.toFixed(4)}) translate(${-farX} ${-horizon})"><rect x="${localX.toFixed(2)}" y="${localY.toFixed(1)}" width="${localW.toFixed(2)}" height="${localH.toFixed(1)}" fill="${fill}"/></g>`
    );
  }
  return chunks.join("");
}

function floorRunStrips({
  y0,
  y1,
  fill,
  count = 24,
  farScale = 0.48,
  nearScale = 1.06,
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

function phpWings(phpW, phpH) {
  const wingW = phpW * 0.95;
  const wingH = phpH * 1.38;
  const flap = 0.32;
  const jointY = -phpH * 0.06;
  const leftX = -phpW * 0.1;
  const rightX = phpW * 0.1;
  return `<g>
      <g transform="translate(${leftX} ${jointY})">
        <animateTransform attributeName="transform" type="rotate" values="-8; 24; -8" keyTimes="0;0.48;1" calcMode="spline" keySplines="0.37 0 0.63 1; 0.37 0 0.63 1" dur="${flap}s" additive="sum" repeatCount="indefinite"/>
        ${image("wing-left", -wingW, -wingH * 0.2, wingW, wingH, ' preserveAspectRatio="xMaxYMid meet"')}
      </g>
      <g transform="translate(${rightX} ${jointY})">
        <animateTransform attributeName="transform" type="rotate" values="8; -24; 8" keyTimes="0;0.48;1" calcMode="spline" keySplines="0.37 0 0.63 1; 0.37 0 0.63 1" dur="${flap}s" additive="sum" repeatCount="indefinite"/>
        ${image("wing-right", 0, -wingH * 0.2, wingW, wingH, ' preserveAspectRatio="xMinYMid meet"')}
      </g>
    </g>`;
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

function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function matrixRain(x, y, w, h) {
  const glyphs = [..."01ABCDEF#$%*+=アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789"];
  const colW = 11;
  const lineH = 11;
  const cols = Math.max(8, Math.floor(w / colW));
  const rows = Math.ceil(h / lineH) + 6;
  const rng = mulberry32(0x4d4711);
  const columns = [];
  for (let col = 0; col < cols; col += 1) {
    const dur = (2.2 + rng() * 3.6).toFixed(2);
    const delay = (-rng() * 4).toFixed(2);
    const stream = [];
    for (let row = 0; row < rows; row += 1) {
      const ch = glyphs[Math.floor(rng() * glyphs.length)];
      const head = row === rows - 1 || rng() > 0.88;
      const fill = head ? "#d8ffd8" : "#00e64d";
      const opacity = head ? 0.95 : (0.16 + rng() * 0.5).toFixed(2);
      const flicker =
        rng() > 0.65
          ? `<animate attributeName="opacity" values="${opacity};0.08;0.9;${opacity}" dur="${(0.12 + rng() * 0.28).toFixed(2)}s" repeatCount="indefinite"/>`
          : "";
      stream.push(
        `<text x="0" y="${(row + 1) * lineH}" fill="${fill}" opacity="${opacity}">${escapeXml(ch)}${flicker}</text>`
      );
    }
    const stack = stream.join("");
    const shift = rows * lineH;
    columns.push(`<g transform="translate(${(x + col * colW + 1).toFixed(1)} ${y})">
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 ${-shift}; 0 0" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
        ${stack}
        <g transform="translate(0 ${shift})">${stack}</g>
      </g>
    </g>`);
  }
  return `<g font-family="Courier New, Lucida Console, monospace" font-size="10">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#000800"/>
    ${columns.join("")}
  </g>`;
}

function parseGithubCalendar(html) {
  const totalMatch = html.match(
    /js-contribution-activity-description[\s\S]*?(\d+)\s+contributions/
  );
  const months = [
    ...html.matchAll(
      /ContributionCalendar-label" colspan="(\d+)"[\s\S]*?aria-hidden="true"[^>]*>([^<]+)/g
    ),
  ].map((match) => ({
    span: Number(match[1]),
    label: match[2].trim(),
  }));
  const cells = [];
  const cellRe =
    /data-date="(\d{4}-\d{2}-\d{2})" id="contribution-day-component-(\d+)-(\d+)" data-level="(\d+)"[\s\S]*?<tool-tip[^>]*>([^<]+)/g;
  let match = cellRe.exec(html);
  while (match) {
    const countMatch = match[5].match(/^(\d+)/);
    cells.push({
      date: match[1],
      dow: Number(match[2]),
      week: Number(match[3]),
      level: Number(match[4]),
      count: countMatch ? Number(countMatch[1]) : 0,
    });
    match = cellRe.exec(html);
  }
  if (!cells.length) {
    throw new Error("No pude leer el calendario de GitHub");
  }
  const counted = cells.reduce((sum, cell) => sum + cell.count, 0);
  const ammo = Number(totalMatch?.[1]);
  return {
    ammo: Number.isFinite(ammo) ? ammo : counted,
    months,
    cells,
    weekCount: Math.max(...cells.map((cell) => cell.week)) + 1,
  };
}

function contributionSky(calendar, wallL, wallR, ceilY, horizon, pad = 56) {
  const colors = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];
  const weeks = Math.max(calendar.weekCount, 1);
  const rows = 7;
  const gap = 1.2;
  const margin = 10;
  const labelH = 12;
  const graphW = wallR - wallL - margin * 2;
  const cell = (graphW - gap * (weeks - 1)) / weeks;
  const graphH = cell * rows + gap * (rows - 1);
  const gx = wallL + margin;
  const gy =
    ceilY + labelH + Math.max(4, (horizon - ceilY - labelH - graphH) / 2);
  let weekCursor = 0;
  const monthTexts = calendar.months
    .map((month) => {
      const x = gx + weekCursor * (cell + gap);
      weekCursor += month.span;
      return `<text x="${x.toFixed(2)}" y="${(gy - 4).toFixed(2)}" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="8" fill="#8b949e">${month.label}</text>`;
    })
    .join("");
  const squares = calendar.cells
    .map((item) => {
      const cx = gx + item.week * (cell + gap);
      const cy = gy + item.dow * (cell + gap);
      const fill = colors[item.level] || colors[0];
      return `<rect x="${cx.toFixed(2)}" y="${cy.toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" rx="1" fill="${fill}"/>`;
    })
    .join("");
  return `<g>
      ${matrixRain(wallL - pad, ceilY - pad, wallR - wallL + pad * 2, horizon - ceilY + pad * 2)}
      ${monthTexts}
      ${squares}
    </g>`;
}

async function fetchContributions() {
  const response = await fetch(
    `https://github.com/users/${USERNAME}/contributions`,
    {
      headers: {
        "User-Agent": "christiantrejoarr-doom-hud",
        Accept: "text/html",
      },
    }
  );
  if (!response.ok) {
    throw new Error(`No pude leer contribuciones (${response.status})`);
  }
  return parseGithubCalendar(await response.text());
}

function renderDoom(calendar) {
  const ammo = calendar.ammo;
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
  const wallL = 148;
  const wallR = 652;
  const horizon = 280;
  const ceilY = 115;
  const vanishY = (ceilY + horizon) / 2;

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
      <animateTransform attributeName="patternTransform" type="translate" values="0 0; 0 160" dur="${FLOOR_DUR}s" repeatCount="indefinite"/>
      ${image("FLOOR7_1", 0, 0, 160, 160)}
    </pattern>
    <pattern id="brickLeft" patternUnits="userSpaceOnUse" width="${BRICK_W}" height="${BRICK_H}">
      <animateTransform attributeName="patternTransform" type="translate" values="0 0; -${BRICK_W} 0" dur="${RUN_DUR}s" repeatCount="indefinite"/>
      ${image("W28_5", 0, 0, BRICK_W, BRICK_H, ' preserveAspectRatio="none"')}
    </pattern>
    <pattern id="brickRight" patternUnits="userSpaceOnUse" width="${BRICK_W}" height="${BRICK_H}">
      <animateTransform attributeName="patternTransform" type="translate" values="0 0; ${BRICK_W} 0" dur="${RUN_DUR}s" repeatCount="indefinite"/>
      ${image("W28_5", 0, 0, BRICK_W, BRICK_H, ' preserveAspectRatio="none"')}
    </pattern>
    <pattern id="ceiling" patternUnits="userSpaceOnUse" width="160" height="160">
      <animateTransform attributeName="patternTransform" type="translate" values="0 0; 0 -160" dur="${FLOOR_DUR}s" repeatCount="indefinite"/>
      ${image("W28_5", 0, 0, 160, 160, ' preserveAspectRatio="none"')}
    </pattern>
    <clipPath id="view">
      <rect width="${WIDTH}" height="${VIEW_H}"/>
    </clipPath>
    <clipPath id="clipFloor">
      <polygon points="-${OVERSCAN},${VIEW_H + OVERSCAN} 0,${VIEW_H} ${wallL},${horizon} ${wallR},${horizon} ${WIDTH},${VIEW_H} ${WIDTH + OVERSCAN},${VIEW_H + OVERSCAN}"/>
    </clipPath>
    <clipPath id="clipCeiling">
      <polygon points="-${OVERSCAN},-${OVERSCAN} 0,0 ${wallL},${ceilY} ${wallR},${ceilY} ${WIDTH},0 ${WIDTH + OVERSCAN},-${OVERSCAN}"/>
    </clipPath>
    <clipPath id="clipLeft">
      <polygon points="-${OVERSCAN},-${OVERSCAN} 0,0 ${wallL},${ceilY} ${wallL},${horizon} 0,${VIEW_H} -${OVERSCAN},${VIEW_H + OVERSCAN}"/>
    </clipPath>
    <clipPath id="clipRight">
      <polygon points="${WIDTH + OVERSCAN},-${OVERSCAN} ${WIDTH},0 ${wallR},${ceilY} ${wallR},${horizon} ${WIDTH},${VIEW_H} ${WIDTH + OVERSCAN},${VIEW_H + OVERSCAN}"/>
    </clipPath>
    <clipPath id="clipSky">
      <polygon points="${wallL - 56},${ceilY - 56} ${wallR + 56},${ceilY - 56} ${wallR + 56},${horizon + 56} ${wallL - 56},${horizon + 56}"/>
    </clipPath>
    <clipPath id="clipSkills">
      <rect x="${276 * SCALE}" y="${BAR_Y + 3 * SCALE}" width="${42 * SCALE}" height="${26 * SCALE}"/>
    </clipPath>
  </defs>

  <rect width="${WIDTH}" height="500" fill="#000"/>

  <g clip-path="url(#view)">
    <g clip-path="url(#clipSky)">
      ${contributionSky(calendar, wallL, wallR, ceilY, horizon)}
    </g>
    <g>
      <animateTransform attributeName="transform" type="translate" values="-22 14; 0 -16; 22 14; 0 -16; -22 14" keyTimes="0;0.25;0.5;0.75;1" calcMode="spline" keySplines="0.37 0 0.63 1; 0.37 0 0.63 1; 0.37 0 0.63 1; 0.37 0 0.63 1" dur="${RUN_DUR * 3.2}s" repeatCount="indefinite"/>
      <g clip-path="url(#clipCeiling)">
        ${floorRunStrips({ y0: -OVERSCAN, y1: ceilY, fill: "url(#ceiling)", farScale: 1.06, nearScale: 0.48 })}
      </g>
      <g clip-path="url(#clipFloor)">
        ${floorRunStrips({ y0: horizon, y1: VIEW_H + OVERSCAN, fill: "url(#floor)" })}
      </g>
      <g clip-path="url(#clipLeft)">
        ${wallRunStrips({ x0: -OVERSCAN, x1: wallL, farX: wallL, horizon: vanishY, fill: "url(#brickLeft)" })}
      </g>
      <g clip-path="url(#clipRight)">
        ${wallRunStrips({ x0: wallR, x1: WIDTH + OVERSCAN, farX: wallR, horizon: vanishY, fill: "url(#brickRight)" })}
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
            ${phpWings(phpW, phpH)}
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
  ${armsLogos(armsX)}
  ${numberRow(ammo, 44 * SCALE, ammoY)}
  ${percent(99, 90 * SCALE, ammoY)}
  ${percent(100, 221 * SCALE, ammoY)}
  ${skillPanel()}
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
  const calendar = await fetchContributions();
  const outputPath = path.join(__dirname, "..", "assets", "doom-play.svg");
  fs.writeFileSync(outputPath, renderDoom(calendar), "utf8");
  const filled = calendar.cells.filter((cell) => cell.count > 0).length;
  console.log(
    `DOOM HUD actualizado: AMMO = ${calendar.ammo}, dias activos = ${filled}, semanas = ${calendar.weekCount}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
