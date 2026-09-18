const fs = require("fs");
const path = require("path");

const photo = fs.readFileSync(path.join(__dirname, "..", "assets", "me.png")).toString("base64");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="920" height="500" viewBox="0 0 920 500">
  <rect width="920" height="500" fill="#ffffff"/>
  <path d="M112 22 H848 A42 42 0 0 1 890 64 V186 A42 42 0 0 1 848 228 H236 L108 278 L188 228 H112 A42 42 0 0 1 70 186 V64 A42 42 0 0 1 112 22 Z" fill="#e6e6e6" stroke="#222222" stroke-width="2.5" stroke-linejoin="round"/>
  <text text-anchor="middle" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="22" fill="#111111">
    <tspan x="480" y="98">Fake profile!!! I'm actually Julian Casablancas the lead</tspan>
    <tspan x="480" y="132">singer of The Strokes and I use this profile to upload</tspan>
    <tspan x="480" y="166">code.</tspan>
  </text>
  <image href="data:image/png;base64,${photo}" xlink:href="data:image/png;base64,${photo}" x="24" y="258" width="148" height="232" preserveAspectRatio="xMidYMid meet"/>
</svg>
`;

fs.writeFileSync(path.join(__dirname, "..", "assets", "intro-bubble.svg"), svg);
console.log("intro-bubble.svg listo");
