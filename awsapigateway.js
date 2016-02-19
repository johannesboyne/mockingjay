var http = require('http'), 
    fs = require('fs'), 
    url = require('url'),
    mockingjay = require('./mockingjay'),
    mock = require('./mock.json')

console.log('Available API Gateway (Mocks)')
Object.keys(mock.sources.apigateway).forEach(function (gatewaykey) {
  console.log(' -> ', gatewaykey)
})
console.log('-------------')

http.createServer(function(r,s) {
  var path = url.parse(r.url).pathname
  console.log('['+r.method+']', r.url)
  if (mock.sources.apigateway[path]) {
    s.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': r.headers['access-control-request-headers'],
      'Access-Control-Allow-Methods': 'GET,POST,PUT,HEAD,DELETE,PATCH'
    })
    if (r.method === 'OPTIONS') {
      s.statusCode = 204;
      return true
    }
    var invoker = mock.sources.apigateway[path]
    var jay     = mockingjay(invoker)
    jay.err.on('data', function (e) {
      console.log('ERROR FROM INVOKER:',e.toString())
    })
    jay.out.pipe(s)
  } else {
    s.writeHead(404)
    s.end('not found')
  }
}).listen(1340)
