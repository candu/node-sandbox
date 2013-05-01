var HelloWorldJS = require('HelloWorld').HelloWorld,
    HelloWorldNative = require('build/Release/HelloWorldNative').HelloWorld;

var hw = new HelloWorldJS();
console.log(hw.hello());
console.log(hw.count());

var hw = new HelloWorldNative();
console.log(hw.hello());
console.log(hw.count());
