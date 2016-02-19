var stdin = ''
process.stdin.on('data', function(chunk) {
  stdin += chunk.toString()
});

process.stdin.on('end', function() {
  var r = JSON.parse(stdin)
  if (require('./../functions/'+r.invoke+'/function.json').runtime === "nodejs") {
    require('./../functions/'+r.invoke).handle(r.event, {succeed: function (results) {
      console.log(JSON.stringify(results))
    }})
  } else {
    console.log('give me some time!')
  }
});
