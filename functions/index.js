const { onRequest } = require('firebase-functions/v2/https')
const next = require('next')
const path = require('path')

const dev = process.env.NODE_ENV !== 'production'
// Para Firebase Functions, o diretório de trabalho é functions/, então precisamos voltar um nível
const nextjsDistDir = path.join(__dirname, '..', '.next')

const app = next({
  dev: false, // Sempre false em produção
  conf: {
    distDir: nextjsDistDir,
  },
})

const handle = app.getRequestHandler()

// Preparar o app uma vez ao inicializar a função
let isAppPrepared = false
const prepareApp = async () => {.
  if (!isAppPrepared) {
    await app.prepare()
    isAppPrepared = true
  }
}

exports.nextjs = onRequest(async (req, res) => {
  await prepareApp()
  return handle(req, res)
})

