// jshint esnext:true
// jshint node: true
'use strict';

const http      = require('http'), 
    fs          = require('fs'), 
    mockingjay  = require('./mockingjay'),
    s3local     = require('./s3local'),
    dynamolocal = require('./dynamodblocal'),
    url         = require('url'),
    mock        = require('./mock.json'),
    spawn       = require('child_process').spawn

console.log('Available API Gateway (Mocks)')
Object.keys(mock.sources.apigateway).forEach(function (gatewaykey) {
  console.log(' -> ', gatewaykey)
})
console.log('-------------')

// init AWS services
http.createServer(function(r,s) {
  var _url  = url.parse(r.url, true)
  var path  = _url.pathname
  var query = _url.query

  console.log('['+r.method+'](r)', path)

  s.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': r.headers['access-control-request-headers'],
    'Access-Control-Allow-Methods': 'GET,POST,PUT,HEAD,DELETE,PATCH'
  })
  if (r.method === 'OPTIONS') {
    s.statusCode = 204;
    return s.end('accepted')
  }

  function λ(path, s, event) {
    var invoker = mock.sources.apigateway[path]
    invoker.event = event || invoker.event
    var jay     = mockingjay(invoker)
    jay.err.on('data', function (e) {
      console.log('ERROR FROM INVOKER:',e.toString())
    })
    jay.out.pipe(s)
  }

  if(path.match(/\/2015-03-31\/functions\//)) {
    // LAMBDA
    var _d = ''
    r.on('data', function (d) {
      _d += d.toString()
    })
    r.on('end', function () {
      var rj = JSON.parse(_d)
      if(path.match(/\/2015-03-31\/functions\//)) {
        console.log('INVOKE', path, query)
        var invokerObj = {
          invoke: path.split('/')[3].replace(mock["project-prefix"]+'_',''),
          event: rj,
        }
        console.dir(invokerObj)
        mockingjay(invokerObj).out.pipe(s)
      }
    })
  } else if(path.match(/\/execute\//)) {
    path = path.replace(/\/execute/, '');
    console.log('FOUND PATH', path)
    if (mock.sources.apigateway[path]) {
      console.log('EXECUTE', path, query)
      if (r.method === 'POST') {
        var _e = ''
        r.on('data', function (d) { _e += ''+d; })
        r.on('end', function () {
          λ(path, s, JSON.parse(_e))
        })
      } else {
        if (Object.keys(query).length > 0) {
          λ(path, s, query)
        } else {
          λ(path, s)
        }
      }
    } else {
      s.writeHead(404)
      s.end('not found')
    }
  }
}).listen(1339)

// init dynamoDB
console.log('start dynamodb local')
dynamolocal(() => {
  console.log('DynamoDB terminated')
})


// init s3 
// @TODO(jb): init GoFakeS3 service here
