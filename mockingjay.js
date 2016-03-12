var stream = require('stream')
var spawn = require('child_process').spawn

module.exports = function (invoker) {
  var mock  = spawn('/usr/local/bin/node', ['lambdarunner.js'])
  mock.stdin.end(JSON.stringify(invoker))
  return {out: mock.stdout, err: mock.stderr}
}
