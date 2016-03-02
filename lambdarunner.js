var stdin = ''
process.stdin.on('data', function(chunk) {
  stdin += chunk.toString()
});

process.stdin.on('end', function() {
  var r = JSON.parse(stdin)
  if (require('./../functions/'+r.invoke+'/function.json').runtime === "nodejs") {
    var ctx = {
      succeed: function (results) {
        console.log(JSON.stringify(results))
      },
      fail: function (err) {
        console.error(JSON.stringify(err))
      }
    }
    if (r.context) {
      Object.keys(r.context).forEach(function (k) {
        ctx[k] = r.context[k]
      })
    }
    require('./../functions/'+r.invoke).handle(r.event, ctx)
  } else {
    console.log('give me some time!')
  }
});
