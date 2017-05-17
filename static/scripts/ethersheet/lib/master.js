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
        url = url.replace(/\/images\//, "");
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
        var host    = request.headers['host'].split(':')[0];
        var referer = request.headers.referer;
        var key;
        if( _.isUndefined(referer) )//main dataset page request
        {
            key = getResourceKeyFromURL(request.url);
        }else{//request generate from main dataset page
            key = getResourceKeyFromURL(URL.parse(referer).pathname);
            if(key === "" || parseInt(URL.parse(referer).port) !== config.port){
                //static resources
                if(key === URL.parse(referer).pathname){
                    key = getResourceKeyFromURL(request.url);
                }else{
                    var servers_keys = Object.keys(slaveServers);
                    key = servers_keys[Math.floor(Math.random() * servers_keys.length)];
                }
            }
        }
        if ( _.isUndefined(slaveServers[key]) ) {
            /*console.log("URL: " + request.url);
            console.log("REFERER: " + referer);
            console.log("KEY: " + key);*/
            slaveServers[key] = {worker : cluster.fork(), request : request, response: response};
            //Proxy first request ofter eorker is online
            slaveServers[key].worker.on('message', function( data ){
                var key = getKeyByWorkerPid(data.pid);
                proxy.web(slaveServers[key].request, slaveServers[key].response, {target : "http://" + host + ":" + (config.port + data.pid)}, function(e){console.log(e)});
            });
            //Kill worker when there are not users in the related room
            cluster.on('exit', function(worker, code, signal){
                delete slaveServers[getKeyByWorkerPid(worker.process.pid)];
             });
            //proxy the request after worker creates the server
            console.log("WORKERS: " + Object.keys(cluster.workers).length);
        }else{
            proxy.web(request, response, {target : "http://" + host + ":" + (config.port + slaveServers[key].worker.process.pid)}, function(e){});
        }
    };

    if (cluster.isMaster) {
        http.createServer(assignSlave).listen(config.port);
    }else if(cluster.isWorker){
        var cloned_config = require('../config');
        cloned_config.port = (config.port  + process.pid);
        server.createServer(cloned_config);
    }
};
