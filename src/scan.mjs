// Hero "profile scan": janela de terminal com um retrato em matriz de
// caracteres sendo varrido, e a ficha de dados ao lado.
//
// O retrato e gerado por formula — nao ha imagem embutida. Cada celula da
// grade recebe uma densidade a partir da silhueta (cabeca + ombros) e escolhe
// um caractere na rampa. Isso mantem o arquivo em poucos KB e deixa o desenho
// escalar sem perder nitidez.

import { svg, MONO, esc } from './theme.mjs'

const W = 880
const H = 408
const BAR = 34 // altura da barra de titulo

const COLS = 46
const ROWS = 28

const RAMP = ' .·:-=+*#%@'

// Ruido deterministico: o mesmo perfil sempre gera o mesmo retrato.
function noise(c, r) {
  const n = Math.sin(c * 12.9898 + r * 78.233) * 43758.5453
  return n - Math.floor(n)
}

// Silhueta do robo. A cabeca e uma superelipse (quadrado arredondado), que
// le como "robo" onde uma elipse leria como "pessoa". Os ombros alargam e
// entao param — se continuassem abrindo, a figura viraria uma piramide.
const HEAD = { cx: 0.5, cy: 0.31, rx: 0.27, ry: 0.27, n: 5 }
const EYE = { y: 0.30, dx: 0.115, r: 0.058 }

function silhouette(u, v) {
  const head = 1 - (Math.abs((u - HEAD.cx) / HEAD.rx) ** HEAD.n +
                    Math.abs((v - HEAD.cy) / HEAD.ry) ** HEAD.n)

  const mast = Math.abs(u - 0.5) < 0.013 && v > 0.025 && v < 0.055 ? 0.55 : -1
  const tip = Math.hypot((u - 0.5) / 0.028, (v - 0.018) / 0.028) < 1 ? 0.95 : -1
  const neck = Math.abs(u - 0.5) < 0.072 && v > 0.585 && v < 0.70 ? 0.5 : -1

  let body = -1
  if (v > 0.70) {
    const tt = Math.min(1, (v - 0.70) / 0.17)
    const halfW = 0.17 + 0.23 * Math.sqrt(tt)
    body = 1 - ((u - 0.5) / halfW) ** 2
  }
  return Math.max(head, mast, tip, neck, body)
}

export function scan(t, data) {
  const padX = 20
  const leftW = 384
  const gridX = padX + 6
  const gridY = BAR + 26
  const cellW = leftW / COLS
  const cellH = (H - gridY - 26) / ROWS

  // ── retrato ──────────────────────────────────────────────────────────────
  const rows = []
  for (let r = 0; r < ROWS; r++) {
    const glyphs = []
    for (let c = 0; c < COLS; c++) {
      const u = (c + 0.5) / COLS
      const v = (r + 0.5) / ROWS
      let d = silhouette(u, v)
      if (d <= 0) continue

      // Olhos e visor: o visor rebaixa a densidade em volta para os olhos
      // terem contraste; sem isso eles somem no meio dos '@'.
      const eye = Math.min(Math.hypot((u - (0.5 - EYE.dx)) / EYE.r, (v - EYE.y) / EYE.r),
                           Math.hypot((u - (0.5 + EYE.dx)) / EYE.r, (v - EYE.y) / EYE.r))
      const isEye = eye < 1
      const inVisor = !isEye && Math.abs(v - EYE.y) < 0.062 && Math.abs(u - 0.5) < 0.215
      // Grelha da "boca": tres traços curtos abaixo do visor.
      const grill = Math.abs(v - 0.455) < 0.018 && Math.abs(u - 0.5) < 0.10
                    && Math.round((u - 0.5) / 0.045) % 2 === 0

      d = Math.min(1, d * 0.9 + noise(c, r) * 0.42)
      if (inVisor) d *= 0.26
      if (grill) d = Math.min(1, d + 0.5)
      const idx = isEye ? RAMP.length - 1 : Math.max(1, Math.round(d * (RAMP.length - 1)))
      const ch = RAMP[idx]
      if (ch === ' ') continue

      const op = isEye ? 1 : (0.22 + (idx / (RAMP.length - 1)) * 0.68).toFixed(2)
      glyphs.push(
        `<text x="${(gridX + c * cellW).toFixed(1)}" y="${(gridY + r * cellH).toFixed(1)}"${isEye ? ' class="eye"' : ''} opacity="${op}">${esc(ch)}</text>`
      )
    }
    rows.push(`<g class="row" style="animation-delay:${(-(r / ROWS) * 3.2).toFixed(2)}s">${glyphs.join('')}</g>`)
  }

  // ── ficha de dados ───────────────────────────────────────────────────────
  const langs = data.languages.slice(0, 4).map((l) => l.name).join(' · ')
  const fields = [
    ['NAME', data.name],
    ['ROLE', 'Full Stack Developer'],
    ['FOCUS', 'AI & ML Engineer'],
    ['LOCATION', 'Brazil'],
    ['LANGUAGES', langs],
    ['COMMITS', String(data.commits)],
    ['REPOS', String(data.repoCount)],
    ['STREAK', `${data.streak} ${data.streak === 1 ? 'dia' : 'dias'}`],
  ]

  const rx = padX + leftW + 30
  const valX = rx + 108
  const fy = BAR + 40
  const step = 30

  const table = fields.map(([k, v], i) => `
    <text x="${rx}" y="${fy + i * step}" class="k">${esc(k)}</text>
    <text x="${valX}" y="${fy + i * step}" class="v">${esc(v)}</text>`).join('')

  const statusY = fy + fields.length * step + 4
  const body = `
  <rect width="${W}" height="${H}" rx="10" fill="${t.scanBg}"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="none" stroke="${t.scanBorder}"/>

  <path d="M0 10 a10 10 0 0 1 10 -10 h${W - 20} a10 10 0 0 1 10 10 v${BAR - 10} h-${W} z" fill="${t.scanBar}"/>
  <line x1="0" y1="${BAR}" x2="${W}" y2="${BAR}" stroke="${t.scanBorder}"/>
  <circle cx="20" cy="${BAR / 2}" r="4.5" fill="#FF5F57"/>
  <circle cx="38" cy="${BAR / 2}" r="4.5" fill="#FEBC2E"/>
  <circle cx="56" cy="${BAR / 2}" r="4.5" fill="#28C840"/>
  <text x="${W / 2}" y="${BAR / 2 + 4}" class="wt">profile scan — ${esc(data.login)}</text>

  <line x1="${padX + leftW + 8}" y1="${BAR + 14}" x2="${padX + leftW + 8}" y2="${H - 14}" stroke="${t.scanBorder}"/>

  <g class="art" fill="${t.scanInk}">
    ${rows.join('\n    ')}
  </g>
  <rect class="beam" x="${gridX - 6}" y="${gridY - 12}" width="${leftW}" height="2" fill="${t.scanHot}"/>

  ${table}
  <line x1="${rx}" y1="${statusY - 14}" x2="${W - padX}" y2="${statusY - 14}" stroke="${t.scanBorder}"/>
  <circle class="led" cx="${rx + 4}" cy="${statusY + 6}" r="4" fill="${t.scanHot}"/>
  <text x="${rx + 16}" y="${statusY + 10}" class="st">scan complete · disponível para conversar</text>`

  const css = `
.art text{font:${(cellH * 0.92).toFixed(1)}px ${MONO};dominant-baseline:middle}
.eye{fill:${t.scanHot}}
.wt{font:400 11.5px ${MONO};fill:${t.scanDim};text-anchor:middle;letter-spacing:.5px}
.k{font:400 11.5px ${MONO};fill:${t.scanDim};letter-spacing:1.4px}
.v{font:500 13px ${MONO};fill:${t.scanInk}}
.st{font:400 11.5px ${MONO};fill:${t.scanDim}}

/* A varredura desce brilhando fileira por fileira. Sem animação as fileiras
   ficam no brilho normal — o retrato continua inteiro. */
.row{animation:sweep 3.2s linear infinite}
@keyframes sweep{0%,14%{opacity:1}5%{opacity:.35}7%{opacity:1;filter:brightness(2.2)}}

.beam{animation:beam 3.2s linear infinite;opacity:.75}
@keyframes beam{from{transform:translateY(0)}to{transform:translateY(${(H - gridY + 4).toFixed(0)}px)}}

.led{animation:led 2s ease-in-out infinite}
@keyframes led{0%,100%{opacity:1}50%{opacity:.3}}
`
  return svg({ w: W, h: H, title: `${data.name} — profile scan`, body, css })
}
