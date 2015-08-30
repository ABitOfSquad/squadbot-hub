var net = require("net")
var fs = require("fs")

function print(text, color) {
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
}

var server = net.createServer(function(socket) {
    function send(type, data) {
        socket.write(JSON.stringify({"type": type, "data": data}))
        
        if (type == "error") {
            socket.destroy()
        }
    }
    
    print("Connected to " + socket.remoteAddress)
    
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
                    if (!req.name) {
                        send("error", "Missing protocol name")
                    }
                    
                    var protocolList = fs.readdirSync("protocols")
                    
                    if (protocolList.indexOf(req.name) == -1) {
                        send("error", "Requested protocol not known")
                    }
                    
                    var fileList = fs.readdirSync("protocols/" + req.name)
                    var files = []
                    
                    for (var i = 0; i < fileList.length; i++) {
                        files.push({
                            "name": fileList[i],
                            "data": fs.readFileSync("protocols/" + req.name + "/" + fileList[i]).toString("utf-8")
                        })
                    }
                    
                    send("saveProtocol", files)
                    socket.destroy()
                    break;
                default:
                    send("error", "Unknown type")
            }
            
            console.log(req)
        }
        catch (err) {
            console.log(err.stack);
        }
    })
})

server.listen(4575)

print("Server now running")
