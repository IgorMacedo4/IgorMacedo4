// Cards de projeto — substituem os pins do github-readme-stats.
// Cada card e um SVG proprio para que o README possa envolver cada um num <a>
// e manter os cards clicaveis (link dentro de SVG nao passa pelo proxy camo).

import { svg, backdrop, MONO, SANS, esc } from './theme.mjs'

const W = 430
const H = 156
const PAD = 22

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

// Quebra por largura estimada: fonte do sistema varia, entao trabalhamos com
// uma media conservadora de avanço por caractere.
function wrap(text, maxWidth, perChar) {
  const max = Math.floor(maxWidth / perChar)
  const lines = []
  let line = ''
  for (const word of String(text).split(/\s+/)) {
    if (!line) line = word
    else if ((line + ' ' + word).length <= max) line += ' ' + word
    else { lines.push(line); line = word }
    if (lines.length === 2) break
  }
  if (line && lines.length < 2) lines.push(line)
  if (lines.length === 2 && lines.join(' ').length < String(text).length) {
    lines[1] = lines[1].replace(/[.,;:]?$/, '') + '…'
  }
  return lines
}

export function projectCard(t, repo) {
  const accent = repo.languageColor || t.accent
  const desc = wrap(repo.description || 'Sem descrição.', W - PAD * 2, 6.05)
  const d = new Date(repo.pushedAt)
  const updated = `${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`

  const lines = desc.map((l, i) =>
    `<text x="${PAD}" y="${74 + i * 18}" class="d" fill="${t.muted}">${esc(l)}</text>`).join('\n  ')

  const meta = []
  if (repo.language) {
    meta.push(`<circle cx="${PAD + 4}" cy="${H - 26}" r="4.5" fill="${accent}"/>
  <text x="${PAD + 16}" y="${H - 22}" class="m" fill="${t.muted}">${esc(repo.language)}</text>`)
  }
  // Estrela so aparece quando ha o que mostrar: repetir "0" em todo card
  // chama atencao justamente para o numero fraco.
  if (repo.stars > 0) {
    const starX = PAD + (repo.language ? 16 + repo.language.length * 6.9 + 18 : 0)
    meta.push(`<path d="M${starX} ${H - 24} l1.6 3.4 3.7.5-2.7 2.6.7 3.7-3.3-1.8-3.3 1.8.7-3.7-2.7-2.6 3.7-.5z" fill="${t.muted}" transform="translate(0,-4)"/>
  <text x="${starX + 12}" y="${H - 22}" class="m" fill="${t.muted}">${repo.stars}</text>`)
  }

  const body = `
  ${backdrop(t, W, H, 10)}
  <rect x="0" y="0" width="${W}" height="3" rx="1.5" fill="${accent}"/>
  <rect width="${W}" height="${H}" rx="10" fill="none" stroke="${accent}" stroke-opacity="0.28"/>
  <text x="${PAD}" y="46" class="n" fill="${t.text}">${esc(repo.name)}</text>
  ${lines}
  <line x1="${PAD}" y1="${H - 44}" x2="${W - PAD}" y2="${H - 44}" stroke="${t.borderSoft}"/>
  ${meta.join('\n  ')}
  <text x="${W - PAD}" y="${H - 22}" class="u" fill="${t.muted}">${esc(updated)}</text>`

  const css = `
.n{font:700 15.5px ${MONO};letter-spacing:-.2px}
.d{font:400 11.5px ${SANS}}
.m{font:400 11px ${MONO}}
.u{font:400 11px ${MONO};text-anchor:end}
`
  return svg({ w: W, h: H, title: `${repo.name} — ${repo.description || 'repositório'}`, body, css })
}
