// Loads the browser scripts into a Node vm context and builds a ppc() app from a grade JSON
const fs   = require('node:fs')
const path = require('node:path')
const vm   = require('node:vm')

const ROOT    = path.join(__dirname, '..')
const SCRIPTS = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
  .match(/<script src="(?!https?:)[^"]+"/g)
  .map(tag => tag.slice(13, -1))
  .filter(src => !src.startsWith('partials/'))

function loadContext() {
  const store   = {}
  const context = vm.createContext({
    localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v } },
    console,
  })
  const source = SCRIPTS.map(src => fs.readFileSync(path.join(ROOT, src), 'utf8')).join('\n')
  vm.runInContext(source + '\nthis.ppc = ppc; this.buildConstraints = buildConstraints', context)
  return context
}

function readGrade(file = 'grade-curricular.json') {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'))
}

function makeApp(state = readGrade()) {
  const context = loadContext()
  const app     = context.ppc()
  app._applyState(JSON.parse(JSON.stringify(state)))
  return { app, context }
}

// Values from the vm realm fail strict deepEqual; a JSON round trip brings them home
const plain = value => JSON.parse(JSON.stringify(value))

function panel(app) {
  return plain(app.constraints().map(({ id, label, ok, value, warn }) => ({ id, label, ok, value, warn: !!warn })))
}

module.exports = { makeApp, readGrade, panel, plain }
