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

    function getResourceString(url){
        url = url.replace(/\/s\//, "");
        url = url.replace(/\/pubsub\/?.*/, "");
        url = url.replace(/\/es_client\/?.*/, "");
        return url;
    };

    function assignSlave(request, response)
    {
        var host    = request.headers['host'].split(':')[0];
        var referer = request.headers.referer;
        var key;
        if( _.isUndefined(referer) )//main dataset page request
        {
            key = getResourceString(request.url);
        }else{//request generate from main dataset page
            key = getResourceString(URL.parse(referer).pathname);
            if(key === "" || parseInt(URL.parse(referer).port) !== config.port){//static resources
                var servers_keys = Object.keys(slaveServers);
                key = servers_keys[Math.floor(Math.random() * servers_keys.length)];
            }
        }
        //console.log("KEY: " + key);
        if ( _.isUndefined(slaveServers[key]) ) {
            slaveServers[key] = cluster.fork();
            //Kill worker when there are not users in the related room
            cluster.on('exit', function(worker, code, signal){
                var keys = Object.keys(slaveServers);
                for(var k in keys){
                    if(slaveServers[keys[k]].process.pid === worker.process.pid){
                        delete slaveServers[keys[k]];
                        break;
                    }
                }
            });
            //proxy the request after worker creates the server
            setTimeout(function (){
                proxy.web(request, response, {target : "http://" + host + ":" + (config.port + slaveServers[key].process.pid)}, function(e){console.log(e)});
            },500);

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
