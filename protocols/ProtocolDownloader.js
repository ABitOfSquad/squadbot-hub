var host = "https://raw.githubusercontent.com/ABitOfSquad/squadbot-protocols/";
var protocolRepository;
var protocolList;

var request = require("./../util/HTTPFileRequest");
var fs = require("fs");
var path = require('path');

function initProtocolFile(){
    var fileHost = getGithubContentUrl("master") + "/spm.json";

    request.request(fileHost, function(fileData){
        protocolRepository = JSON.parse(fileData);

        if(protocolRepository !== undefined && protocolRepository.protocols !== undefined){
            protocolList = protocolRepository.protocols;
        }

        print("Available protocols on github: " + protocolList.toString());

        protocolList.forEach(function(_name){

            print("Loading " + _name + "...");
            var name = _name;
            var conf = getProtocolConfig(_name);

            if(conf){
                var stable = conf.stable_version;
                var fileList = conf.files;

                try {
                    fs.mkdirSync(path.resolve(__dirname, "cache"));
                    fs.mkdirSync(path.resolve(__dirname, "../cache"));
                    fs.mkdirSync(path.resolve(__dirname, "cache/" + name));
                } catch(err){

                }

                fileList.forEach(function(file){
                    var url = getGithubContentUrl(stable) + name + "/" + file;
                    var cachepath = path.resolve(__dirname, 'cache/' + name + "/" + file);
                    print(cachepath);

                    try{
                        request.request(url, function(data){
                            fs.writeFileSync(cachepath, data)
                        })
                    } catch(err){
                        console.log(err)
                    }
                });

                fs.writeFileSync(path.resolve(__dirname, '../cache/protocols.json'), JSON.stringify(protocolRepository));

                print("Loaded " + name + ", using latest stable version: " + stable)
            }
        });
    });
}

function getGithubContentUrl(version){
    return host + version + "/"
}

function getProtocolConfig(name){
    var endObj;
    try{
        protocolRepository = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../cache/protocols.json')));
        if(protocolRepository[name] === undefined){
            return false;
        } else {
            endObj = protocolRepository[name];
            if(endObj.files === undefined || endObj.stable_version === undefined){
                return false;
            } else {
                return endObj
            }
        }
    } catch(err) {
        return false;
    }

}

exports.getProtoConfig = function(name) { return getProtocolConfig(name)};

initProtocolFile();