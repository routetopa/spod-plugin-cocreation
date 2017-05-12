var http           = require('http');
var cluster        = require('cluster');
var httpProxy      = require('http-proxy');
var _              = require('underscore');
var server         = require('./server');
var config         = require('../config');

exports.createMasterServer = function(config){

    var slaveServers = [];
    var proxy = httpProxy.createProxyServer();

    function assignSlave(request, response)
    {
        var host = request.headers['host'].split(':')[0];
        var key = null;
        if(typeof request.headers.referer === 'undefined'){
            if(request.url.indexOf("\\s\\")){
                key = request.url.replace(/\/s\//, "");
                key = key.replace(/\/pubsub\/?.*/, "");
            }
        }else{
            key = request.headers.referer.split("/")[4];
            if(key === "styles"){
                key = Object.keys(slaveServers)[0];
            }
        }
        if (typeof slaveServers[key] === 'undefined') {
            slaveServers[key] = cluster.fork();
            cluster.on('exit', function(worker, code, signal){
                var keys = Object.keys(slaveServers);
                for(var k in keys){
                    if(slaveServers[keys[k]].process.pid === worker.process.pid){
                        delete slaveServers[keys[k]];
                        break;
                    }
                }
            });
            //redirect to the related worker - only for the first client
            if(request.url.indexOf("pubsub") === -1){//Client is being reconnecting so let the server answer to the socket channel
                response.writeHead(200, {"Content-Type": "text/html"});
                response.write("<html><head><title></title></head><body><script>setTimeout(function(){location.reload()},1500)</script></body></html>");
                response.end();
            }
        }else{
            proxy.web(request, response, {target : "http://" + host + ":" + (config.port + slaveServers[key].process.pid)}, function(e){});
        }
    };

    if (cluster.isMaster) {
        var front_server = http.createServer(assignSlave).listen(config.port);
    }else if(cluster.isWorker){
        var cloned_config = require('../config');
        cloned_config.port = (config.port  + process.pid);
        server.createServer(cloned_config);
    }
};
