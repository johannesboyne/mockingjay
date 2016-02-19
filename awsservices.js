var http = require('http'), 
    fs = require('fs'), 
    mockingjay = require('./mockingjay'),
    url = require('url')

http.createServer(function(r,s) {
  var path = url.parse(r.url).pathname
  console.log('['+r.method+'](r)', path)
  switch (r.method) {
    case 'POST':
      var _d = ''
      r.on('data', function (d) {
        _d += d.toString()
      })
      r.on('end', function () {
        var rj = JSON.parse(_d)
        if (rj.hasOwnProperty('TableName')) {
          // --------------------------------------------------------- dynamodb
          var fileName = JSON.stringify([rj.TableName,rj.ExpressionAttributeValues])
          .replace(/[^a-z0-9]/gi, '.')
          .replace(/\.{2}/g, '')
          .toLowerCase()
          s.end(fs.readFileSync('./responses/dynamodb/'+fileName+'.json'))
        } else if(path.match(/\/2015-03-31\/functions\//)) {
          // ----------------------------------------------------------- lambda
          mockingjay({invoke: "message_service", event: rj}).out.pipe(s)
        }
      })
      break;
    case 'GET':
      // ------------------------------------------------------------------- s3
      switch (path) {
        case '/':
          var px = url.parse(r.url, true).query.prefix
          if (px)
            s.end(fs.readFileSync('./responses/s3/'+px+'/listobjects.xml'))
          else
            s.end(fs.readFileSync('./responses/s3/listobjects.xml'))
        break
        default:
          s.end(fs.readFileSync('./responses/s3'+path))
        break;
      }
    break;
    case 'HEAD':
      s.writeHead(200, JSON.parse(fs.readFileSync('./responses/s3'+path+'.HEAD.json')))
      s.end()
    break;
  }
}).listen(1339)
