var net = require("net");

var client = new net.Socket();

client.connect(4575, "localhost", function() {
	console.log('Connected');
	client.write('{"type": "getProtocol", "name": "whatsapp"}');
});

client.on('data', function(data) {
	console.log(data.toString("utf-8"));
});

client.on('end', function(data) {
	console.log("end");
});

client.on('close', function() {
	console.log('Connection closed');
});
