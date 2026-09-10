// Coleta os dados do perfil via GitHub GraphQL e escreve src/data.json.
// Funciona com GITHUB_TOKEN (dados publicos) ou com um PAT em METRICS_TOKEN
// (inclui repositorios privados nas contagens e nas linguagens).

import { writeFileSync } from 'node:fs'

const LOGIN = process.env.GH_LOGIN || 'IgorMacedo4'
const TOKEN = process.env.METRICS_TOKEN || process.env.GITHUB_TOKEN
if (!TOKEN) throw new Error('defina METRICS_TOKEN ou GITHUB_TOKEN')

const QUERY = `
query($login: String!, $cursor: String) {
  user(login: $login) {
    name
    login
    createdAt
    followers { totalCount }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks { contributionDays { contributionCount date } }
      }
    }
    pullRequests(states: MERGED) { totalCount }
    repositories(first: 100, after: $cursor, ownerAffiliations: OWNER, isFork: false,
                 orderBy: {field: PUSHED_AT, direction: DESC}) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes {
        name
        description
        url
        isPrivate
        stargazerCount
        forkCount
        pushedAt
        primaryLanguage { name color }
        languages(first: 12, orderBy: {field: SIZE, direction: DESC}) {
          edges { size node { name color } }
        }
      }
    }
  }
}`

async function gql(variables) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'profile-readme-renderer',
    },
    body: JSON.stringify({ query: QUERY, variables }),
  })
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}: ${await res.text()}`)
  const json = await res.json()
  if (json.errors) throw new Error(`GraphQL: ${JSON.stringify(json.errors)}`)
  return json.data.user
}

let user = null
let repos = []
let cursor = null
do {
  const page = await gql({ login: LOGIN, cursor })
  user ??= page
  repos = repos.concat(page.repositories.nodes)
  cursor = page.repositories.pageInfo.hasNextPage ? page.repositories.pageInfo.endCursor : null
} while (cursor)

// Linguagens contadas por NUMERO DE REPOSITORIOS, nao por bytes. Bytes
// distorcem: um repo Python com dependencias vendorizadas arrasta C, Cython e
// TeX pra lista e afunda TypeScript pra 1%, o que nao reflete o que se usa.
const byLang = new Map()
for (const repo of repos) {
  if (!repo.primaryLanguage) continue
  const { name, color } = repo.primaryLanguage
  const entry = byLang.get(name) ?? { name, color, count: 0 }
  entry.count += 1
  byLang.set(name, entry)
}
const totalTyped = [...byLang.values()].reduce((sum, l) => sum + l.count, 0)
const languages = [...byLang.values()]
  .sort((a, b) => b.count - a.count)
  .slice(0, 6)
  .map((l) => ({ ...l, pct: totalTyped ? (l.count / totalTyped) * 100 : 0 }))

// Repos criados/atualizados por ano — mostra a curva de atividade.
const byYear = new Map()
for (const repo of repos) {
  const year = repo.pushedAt.slice(0, 4)
  byYear.set(year, (byYear.get(year) ?? 0) + 1)
}
const activity = [...byYear.entries()]
  .sort((a, b) => a[0].localeCompare(b[0]))
  .slice(-5)
  .map(([year, count]) => ({ year, count }))

const c = user.contributionsCollection
const days = c.contributionCalendar.weeks.flatMap((w) => w.contributionDays)

// Streak atual: conta pra tras a partir do ultimo dia com atividade. O dia de
// hoje ainda vazio nao zera o streak, so ainda nao comecou.
let streak = 0
for (let i = days.length - 1; i >= 0; i--) {
  if (days[i].contributionCount > 0) streak++
  else if (streak > 0 || i < days.length - 1) break
}

const data = {
  generatedAt: new Date().toISOString(),
  login: user.login,
  name: user.name || user.login,
  followers: user.followers.totalCount,
  commits: c.totalCommitContributions + c.restrictedContributionsCount,
  prs: c.totalPullRequestContributions,
  prsMerged: user.pullRequests.totalCount,
  issues: c.totalIssueContributions,
  contributionsYear: c.contributionCalendar.totalContributions,
  streak,
  repoCount: repos.length,
  publicRepoCount: repos.filter((r) => !r.isPrivate).length,
  stars: repos.reduce((sum, r) => sum + r.stargazerCount, 0),
  languages,
  activity,
  repos: repos.map((r) => ({
    name: r.name,
    description: r.description,
    url: r.url,
    isPrivate: r.isPrivate,
    stars: r.stargazerCount,
    forks: r.forkCount,
    pushedAt: r.pushedAt,
    language: r.primaryLanguage?.name ?? null,
    languageColor: r.primaryLanguage?.color ?? null,
  })),
}

writeFileSync(new URL('./data.json', import.meta.url), JSON.stringify(data, null, 2))
console.log(
  `ok: ${data.repoCount} repos (${data.publicRepoCount} publicos), ` +
  `${data.commits} commits, ${data.contributionsYear} contribuicoes/ano, ` +
  `streak ${data.streak}d, ${data.languages.length} linguagens`
)
