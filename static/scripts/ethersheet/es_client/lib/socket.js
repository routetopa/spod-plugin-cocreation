if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module) {

var _ = require('underscore');
var $ = require('jquery');
var Events = require('backbone').Events;
var SockJS = require('sockjs-client');

var Socket = module.exports = function(channel,socket_id,websocket){
  var self = this;
  this.recInterval = null;

  this.open_handler = function(){
    clearInterval(this.recInterval);
    $('#es-modal-overlay').show();
  };

  this.close_handler = function(e){

    if(e.code == 1000 || e.code == 1001 || e.code == 1002 || e.code == 1006){
      $('#es-modal-box').html("<h1>Your connection to the server has been lost, maybe it could be unreachable :(</h1>");
      $('#es-modal-overlay').show();
      return;
    }

    this.initWebsocket(channel,socket_id,websocket);
    /*this.recInterval = setInterval(function () {
      self.initWebsocket(channel,socket_id,websocket);
    }, 2000);*/
  };
  this.error_handler = function(){};
  this.message_handler = function(){};

  this.initWebsocket(channel,socket_id,websocket);
};

_.extend(Socket.prototype, Events,{

  recInterval : null,
  channel: null,
  socket_id: null,
  websocket: null,

  initWebsocket: function(channel,socket_id,websocket){
    this.channel   = channel;
    this.socket_id = socket_id;
    this.websocket = websocket;
    this.ws = websocket || new SockJS(window.location.protocol + '//' + window.location.host +'/'+ channel +'/pubsub/',{debug:false,devel:false});
    /*this.ws = websocket || new SockJS(window.location.protocol + '//' + window.location.host +'/'+ channel +'/pubsub/', null, {
          'protocols_whitelist': [
            'websocket',
            'xdr-streaming',
            'xhr-streaming',
            'iframe-eventsource',
            'iframe-htmlfile',
            'xdr-polling',
            'xhr-polling',
            'iframe-xhr-polling',
            'jsonp-polling']
        });*/

    this.ws.onopen = _.bind(this.open,this);
    this.ws.onerror= _.bind(this.error,this);
    this.ws.onclose = _.bind(this.close,this);
    this.ws.onmessage = _.bind(this.message,this);
  },

  onMessage: function(handler){
    this.message_handler = handler;
  },

  message: function(e){
    this.message_handler(e);
  },

  onOpen: function(handler){
    this.open_handler = handler;
  },
  
  open: function(e){
    this.open_handler(e);
  },

  onClose: function(handler){
    this.close_handler = handler;
  },
  
  close: function(e){
    this.close_handler(e);
  },

  onError: function(handler){
    this.error_handler = handler;
  },
  
  error: function(e){
    this.error_handler(e);
  },

  send: function(msg){
    try {
      this.ws.send(msg);
    }catch(e){
      console.log(e);
      $('#es-modal-box').html("<h1>There are some problems with server it could be unreachable :(</h1>");
      $('#es-modal-overlay').show();
    }
  }
});

});
