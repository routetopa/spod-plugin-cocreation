var http           = require('http');
var cluster        = require('cluster');
var httpProxy      = require('http-proxy');
var _              = require('underscore');
var URL            = require('url');
var server         = require('./server');
var config         = require('../config');

exports.createMasterServer = function(config){

    var slaveServers = [];
    var proxy = httpProxy.createProxyServer();

    function getResourceKeyFromURL(url){
        url = url.replace(/\/s\//, "");
        url = url.replace(/\/images\/?.*/, "");
        url = url.replace(/\/import\//, "");
        url = url.replace(/\/upload\//, "");
        url = url.replace(/\/pubsub\/?.*/, "");
        url = url.replace(/\/es_client\/?.*/, "");
        return url;
    };

    function getKeyByWorkerPid(pid){
        var key = undefined;
        var keys = Object.keys(slaveServers);
        for(var k in keys){
            if(slaveServers[keys[k]].worker.process.pid === pid){
                key = keys[k];
                break;
            }
        }
        return key;
    };

    function assignSlave(request, response)
    {
        var referer = request.headers.referer;
        var temp_key, key;

        if(_.isUndefined(referer)){
            temp_key =  request.url;
        }else{
            temp_key =  URL.parse(referer).pathname;
            if( parseInt(URL.parse(referer).port) !== config.port )
                temp_key = request.url;
        }

        key = getResourceKeyFromURL( temp_key );

        if(_.isEmpty(key)){
            //static resources
            var servers_keys = Object.keys(slaveServers);
            key = servers_keys[Math.floor(Math.random() * servers_keys.length)];
        }

        if ( _.isUndefined(slaveServers[key]) ) {
            console.log("URL: " + request.url);
            console.log("REFERER: " + referer);
            console.log("KEY: " + key);
            slaveServers[key] = {worker : cluster.fork(), request : request, response: response, online: false};
            //Proxy first request ofter eorker is online
            slaveServers[key].worker.on('message', function( data ){
                var key = getKeyByWorkerPid(data.pid);
                slaveServers[key].online = true;
                proxy.web(slaveServers[key].request, slaveServers[key].response, {target : "http://localhost:" + (config.port + data.pid)}, function(e){console.log(e)});
            });
            //Kill worker when there are not users in the related room
            cluster.on('exit', function(worker, code, signal){
                delete slaveServers[getKeyByWorkerPid(worker.process.pid)];
             });
            //proxy the request after worker creates the server
            console.log("WORKERS: " + Object.keys(cluster.workers).length);
        }else{

            if (slaveServers[key].online)
                proxy.web(request, response, {target : "http://localhost:" + (config.port + slaveServers[key].worker.process.pid)}, function(e){});
            else
                (function waitServerUp() {
                    //console.log("server is closed now, I wait ...");
                    if (slaveServers[key].online)
                        proxy.web(request, response, {target: "http://localhost:" + (config.port + slaveServers[key].worker.process.pid)}, function (e) {  });
                    else
                        setTimeout(waitServerUp, 1000); //Gives the time to the server to open.
                })();
        }
    };

    if (cluster.isMaster) {
        console.log("MASTER ONLINE");
        http.createServer(assignSlave).listen(config.port);
    }else if(cluster.isWorker){
        var cloned_config = require('../config');
        cloned_config.port = (config.port  + process.pid);
        server.createServer(cloned_config);
    }
};