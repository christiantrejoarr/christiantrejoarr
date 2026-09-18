const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "assets", "stack");

const LOGOS = [
  {
    id: "linkedin",
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/christian-trejo-arroyo/",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg",
  },
  {
    id: "sass",
    name: "Sass",
    href: "https://sass-lang.com/install/",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg",
  },
  {
    id: "scss",
    name: "SCSS",
    href: "https://sass-lang.com/documentation/syntax/",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg",
  },
  {
    id: "css3",
    name: "CSS3",
    href: "https://developer.mozilla.org/docs/Web/CSS",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  },
  {
    id: "html5",
    name: "HTML5",
    href: "https://developer.mozilla.org/docs/Web/HTML",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  },
  {
    id: "javascript",
    name: "JavaScript",
    href: "https://developer.mozilla.org/docs/Web/JavaScript",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  },
  {
    id: "typescript",
    name: "TypeScript",
    href: "https://www.typescriptlang.org/download",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  },
  {
    id: "ionic",
    name: "Ionic",
    href: "https://ionicframework.com/docs/intro/cli",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ionic/ionic-original.svg",
  },
  {
    id: "angular",
    name: "Angular",
    href: "https://angular.dev/installation",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angular/angular-original.svg",
  },
  {
    id: "bootstrap",
    name: "Bootstrap",
    href: "https://getbootstrap.com/docs/5.3/getting-started/download/",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg",
  },
  {
    id: "materialize",
    name: "Materialize",
    href: "https://materializecss.com/getting-started.html",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/materializecss/materializecss-original.svg",
  },
  {
    id: "npm",
    name: "npm",
    href: "https://docs.npmjs.com/downloading-and-installing-node-js-and-npm",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg",
  },
  {
    id: "react-router",
    name: "React Router",
    href: "https://www.npmjs.com/package/react-router",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/reactrouter/reactrouter-original.svg",
  },
  {
    id: "react-native",
    name: "React Native",
    href: "https://reactnative.dev/docs/environment-setup",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/reactnative/reactnative-original.svg",
  },
  {
    id: "react",
    name: "React",
    href: "https://www.npmjs.com/package/react",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  },
  {
    id: "vuejs",
    name: "Vue.js",
    href: "https://www.npmjs.com/package/vue",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg",
  },
  {
    id: "nodejs",
    name: "Node.js",
    href: "https://nodejs.org/en/download",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  },
  {
    id: "yarn",
    name: "Yarn",
    href: "https://yarnpkg.com/getting-started/install",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/yarn/yarn-original.svg",
  },
  {
    id: "mongodb",
    name: "MongoDB",
    href: "https://www.mongodb.com/try/download/community",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  },
  {
    id: "figma",
    name: "Figma",
    href: "https://www.figma.com/downloads/",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
  },
  {
    id: "jira",
    name: "Jira",
    href: "https://www.atlassian.com/software/jira",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jira/jira-original.svg",
  },
  {
    id: "postman",
    name: "Postman",
    href: "https://www.postman.com/downloads/",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg",
  },
  {
    id: "wordpress",
    name: "WordPress",
    href: "https://wordpress.org/download/",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-original.svg",
  },
];

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function timingFor(id, index) {
  const h = hash(id);
  const begin = ((h % 83) / 10 + index * 0.31).toFixed(2);
  const dur = 8 + (h % 7);
  return { begin, dur };
}

function existingDataUri(id) {
  const file = path.join(OUT_DIR, `${id}.svg`);
  if (!fs.existsSync(file)) return null;
  const match = fs.readFileSync(file, "utf8").match(
    /href="(data:image\/svg\+xml;base64,[^"]+)"/
  );
  return match ? match[1] : null;
}

function renderLogo({ id, name, href, dataUri, begin, dur }) {
  const t = `dur="${dur}s" begin="${begin}s" repeatCount="indefinite"`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="96" height="118" viewBox="0 0 96 118" role="img" aria-label="${name}">
  <title>${name}</title>
  <a href="${href}" target="_blank" rel="noopener noreferrer">
    <rect width="96" height="118" fill="transparent"/>
    <g transform="translate(48 40)">
      <g>
        <animateTransform attributeName="transform" type="rotate"
          values="0;0;-24;24;-20;18;-12;10;-4;0;0"
          keyTimes="0;0.10;0.14;0.18;0.22;0.26;0.30;0.34;0.38;0.42;1"
          ${t}/>
        <g>
          <animateTransform attributeName="transform" type="scale"
            values="1 1;1 1;1.1 0.86;0.88 1.14;1.08 0.9;0.92 1.1;1.04 0.96;0.98 1.04;1 1;1 1;1 1"
            keyTimes="0;0.10;0.14;0.18;0.22;0.26;0.30;0.34;0.38;0.42;1"
            ${t}/>
          <image href="${dataUri}" xlink:href="${dataUri}" x="-28" y="-28" width="56" height="56"/>
        </g>
      </g>
    </g>
    <clipPath id="drop-${id}">
      <rect x="0" y="70" width="96" height="48"/>
    </clipPath>
    <g clip-path="url(#drop-${id})">
      <g transform="translate(48 96)">
        <g opacity="0">
          <animate attributeName="opacity"
            values="0;0;1;1;0;0"
            keyTimes="0;0.40;0.44;0.82;0.90;1"
            ${t}/>
          <g>
            <animateTransform attributeName="transform" type="translate"
              values="0 -40;0 -40;0 10;0 -7;0 4;0 0;0 0;0 16"
              keyTimes="0;0.40;0.50;0.56;0.62;0.68;0.82;1"
              calcMode="spline"
              keySplines="0 0 1 1;0.15 0.85 0.35 1;0.3 0 0.7 1;0.3 0 0.7 1;0.3 0 0.7 1;0 0 1 1;0.4 0 1 1"
              ${t}/>
            <g>
              <animateTransform attributeName="transform" type="rotate"
                values="0;0;-16;12;-6;0;0;0"
                keyTimes="0;0.40;0.47;0.54;0.60;0.68;0.82;1"
                ${t}/>
              <g>
                <animateTransform attributeName="transform" type="scale"
                  values="1 1;0.78 1.35;1.38 0.52;0.9 1.18;1.06 0.94;1 1;1 1;1 1"
                  keyTimes="0;0.40;0.50;0.56;0.62;0.68;0.82;1"
                  ${t}/>
                <text fill="#c9d1d9" font-family="Segoe UI, Arial, sans-serif" font-size="11" font-weight="600" x="0" y="0" text-anchor="middle">${name}</text>
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>
  </a>
</svg>
`;
}

async function dataUriFor(logo) {
  const cached = existingDataUri(logo.id);
  if (cached) return cached;
  const response = await fetch(logo.src, {
    headers: { "User-Agent": "christiantrejoarr-stack-logos" },
  });
  if (!response.ok) {
    throw new Error(`No pude descargar ${logo.name} (${response.status})`);
  }
  return `data:image/svg+xml;base64,${Buffer.from(
    await response.arrayBuffer()
  ).toString("base64")}`;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (let i = 0; i < LOGOS.length; i += 1) {
    const logo = LOGOS[i];
    const dataUri = await dataUriFor(logo);
    const { begin, dur } = timingFor(logo.id, i);
    fs.writeFileSync(
      path.join(OUT_DIR, `${logo.id}.svg`),
      renderLogo({ ...logo, dataUri, begin, dur }),
      "utf8"
    );
    console.log(`listo ${logo.id}.svg  begin=${begin}s  dur=${dur}s`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
