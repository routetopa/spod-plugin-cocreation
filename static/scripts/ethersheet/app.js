var config, server;

if(process.env.CONFIG_PATH){
  config = require(process.env.CONFIG_PATH);
} else {
  config = require('./config');
}

process.env.NODE_ENV = 'production';
server = require('./lib/server').createServer(config);
