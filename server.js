var net = require("net");
var path = require('path');
var fs = require("fs");
var protocolDownloader = require("./protocols/ProtocolDownloader");
var protocolManager = require("./protocols/ProtocolManager");

/**
 * Prints a line to the console in a fancy format
 *
 * @param text
 * @param color
 */
global.print = function print(text, color) {
    var output = ""
    
    if (color) {
        output += '\033[31m'
    }
    
    var d = new Date()
    var h = (d.getHours() < 10 ? "0" : "") + d.getHours()
    var m = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes()
    var s = (d.getSeconds() < 10 ? "0" : "") + d.getSeconds()
    
    output += "[" + h + ":" + m + ":" + s + "] " + text
    
    if (color) {
        output += '\033[0m'
    }
    
    console.log(output);
};

var server = net.createServer(function(socket) {
    function send(type, data) {
        socket.write(JSON.stringify({"type": type, "data": data}))
        
        if (type == "error") {
            socket.destroy()
        }
    }
    
    print(socket.remoteAddress + " Made a request to SPM node");

    socket.on("end", function(){
        print("fired");
    });

    /**
     * Handle data
     */
    socket.on("data", function(data) {

        try {
            try {
                var req = JSON.parse(data.toString("utf-8"))
            } catch (err) {
                send("error", "Invalid JSON")
            }
            
            if (!req.type) {
                send("error", "Missing type")
            }
            
            switch (req.type) {
                case "getProtocol":
                    if(!req.name) {
                        send("error", "Missing arguments");
                        return;
                    }

                    var files = [];
                    var protocols = protocolManager.getProtocols();
                    if(protocols.indexOf(req.name) > -1){
                        var name = req.name.toLowerCase();

                        try {
                            var config = protocolDownloader.getProtoConfig(name);

                            if(config){
                                var preparedPacket = { "type" : "sendProtocol" };

                                preparedPacket.fileList = config.files;
                                preparedPacket.npm = config.npm_dependecies;
                                preparedPacket.extendedInfo = config;
                                preparedPacket.filedata = {};

                                preparedPacket.fileList.forEach(function(file, index){
                                    preparedPacket.filedata[file] = fs.readFileSync('./protocols/cache/' + name + "/" + file).toString();

                                    if(index === (config.files.length - 1)){
                                        send("saveProtocol", JSON.stringify(preparedPacket));
                                        socket.destroy()
                                    }
                                });
                            } else {
                                send("error", "Unknown exception 102");
                                socket.destroy();
                            }
                        } catch(err) {
                            send("error", "Unknown exception 101");
                            socket.destroy();
                        }


                    } else {
                        send("error", "Unknown protocol: " + req.name);
                        socket.destroy();
                    }

                    break;
                case "getProtocolList":
                    var list = protocolManager.getProtocols();
                    send("protocolList", list);

                    socket.destroy();
                    break;
                default:
                    send("error", "Unknown type")
            }
        }
        catch (err) {
            console.log(err.stack);
        }
    });
}).listen(4575);

print("Server started! (" + (process.uptime()) + " s)");
