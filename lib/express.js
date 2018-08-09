const metrics = require('./metrics')

function middleware (request, response, done) {
  var start = process.hrtime()

  response.on('finish', function () {
    var requestPath = request.baseUrl
    var dontAddSlashOnBase = request.baseUrl && (request.path === '/' || (request.route && request.route.path === '/'))
    if (!dontAddSlashOnBase) {
      if (request.route) {
        requestPath += request.route.path
      } else {
        requestPath += request.path
      }
    }

    metrics.observe(request.method, requestPath, response.statusCode, start)
  })

  return done()
};

function instrument (server, options) {
  server.use(middleware)
  server.get(options.url, (req, res) => {
    res.header('content-type', 'text/plain; charset=utf-8')
    return res.send(metrics.summary())
  })
}

function instrumentable (server) {
  return server && server.defaultConfiguration && server.use
}

module.exports = {
  instrumentable: instrumentable,
  instrument: instrument
}
