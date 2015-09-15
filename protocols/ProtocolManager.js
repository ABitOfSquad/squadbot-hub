var protocolList = [];

var fs = require("fs");

exports.reloadProtocols = function(){ reloadPrtcls() };

function reloadPrtcls() {
    protocolList = fs.readdirSync("protocols/cache/")
    return protocolList;
}

exports.getProtocols = function getProtocols(){
    return protocolList;
};

exports.prepareProtocolSocket = function prepareProtocolSocket(name){
    var protocolsList = reloadPrtcls()
};