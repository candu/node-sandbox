// quick-and-dirty wc -c implementation
var size = 0;
process.stdin.on('data', function(data) {
  size += data.length;
});
process.stdin.on('end', function() {
  console.log(size);
});
process.stdin.resume();
