HelloWorld = function() {
  this.m_count = 0;
};

HelloWorld.prototype.hello = function() {
  this.m_count++;
  return "Hello World";
};

HelloWorld.prototype.count = function() {
  return this.m_count;
};

exports.HelloWorld = HelloWorld;
