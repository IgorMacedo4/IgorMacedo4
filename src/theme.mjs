// Sistema de design compartilhado por todos os SVGs gerados.
//
// Regra que vale pra tudo aqui: o estado ESTATICO tem que estar completo.
// Animacao so acrescenta movimento, nunca revela conteudo — se o CSS nao rodar
// (proxy, leitor de tela, preview de terminal), nada essencial some.

export const THEMES = {
  dark: {
    id: 'dark',
    bg: '#0D1117',
    panel: '#0F1621',
    border: '#21262D',
    borderSoft: '#1A222C',
    text: '#E6EDF3',
    muted: '#7D8590',
    grid: '#161E28',
    accent: '#2DE2C5',
    violet: '#A371F7',
    green: '#3FB950',
    glow: 0.22,
    // Paleta da janela de scan: um hue só, variando brilho.
    scanBg: '#060D11',
    scanBar: '#0B161B',
    scanBorder: '#12333A',
    scanInk: '#2DE2C5',
    scanHot: '#8BFFEC',
    scanDim: '#4E8F89',
  },
  light: {
    id: 'light',
    bg: '#FFFFFF',
    panel: '#F6F8FA',
    border: '#D8DEE4',
    borderSoft: '#E7EBEF',
    text: '#1F2328',
    muted: '#656D76',
    grid: '#EFF2F5',
    accent: '#0D8F80',
    violet: '#8250DF',
    green: '#1A7F37',
    glow: 0.13,
    scanBg: '#F3FBFA',
    scanBar: '#E4F3F1',
    scanBorder: '#C2DEDA',
    scanInk: '#0B6B60',
    scanHot: '#05A28F',
    scanDim: '#5F8C87',
  },
}

// Os quatro estagios do pipeline ganham cores que contam a historia: o dado
// entra cinza e bruto, vira azul ao ser coletado, roxo ao passar pelo modelo e
// verde quando sai estruturado.
export const stageColor = (t) => [t.muted, t.accent, t.violet, t.green]

export const MONO =
  "ui-monospace, 'SF Mono', 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, 'Liberation Mono', monospace"
export const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif"

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Fundo padrao: retangulo arredondado + malha de pontos discreta.
export function backdrop(t, w, h, r = 12) {
  return `
  <defs>
    <pattern id="grid" width="22" height="22" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="${t.grid}"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" rx="${r}" fill="${t.bg}"/>
  <rect width="${w}" height="${h}" rx="${r}" fill="url(#grid)"/>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${r}" fill="none" stroke="${t.border}"/>`
}

// Envelope do arquivo. width/height explicitos + viewBox para o GitHub
// dimensionar certo dentro do <img>.
export function svg({ w, h, title, body, css }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<style><![CDATA[
${css.trim()}
]]></style>
${body}
</svg>
`
}
