var http = require("https");

exports.request = function request(url, callback){
    var spmdata = "";

    try {
        http.get(url, function(res) {
            res.on("data", function(chunk) {
                spmdata += chunk.toString();
            });

            res.on("end", function(){
                if(spmdata.length == 0 || spmdata === undefined){
                    throw {"something useful" : "something more useful, and informative"};
                }

                callback(spmdata);
            })
        }).on('error', function(err) {
            throw err;
        });
    } catch(err){
        throw err;

    }
};