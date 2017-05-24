var http = require('http');
var express = require('express');
var sockjs = require('sockjs');
var fs = require('fs');
var Command = require('es_command');
var Transactor = require('transactor');
var EtherSheetService = require('./ethersheet_service');
var createTransactionHandler = require('./transaction_handler');
var formidable = require('formidable');

/*ISISLab code*/
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var cookieSession = require('cookie-session');
var compression   = require('compression');

/*End ISISLab code*/

var ES_CLIENT_PATH = __dirname + '/../node_modules/es_client';
var LAYOUT_PATH    = __dirname + '/layouts';


exports.createServer = function(config){

    /***********************************************
     * EtherSheet HTTP Server
     ***********************************************/
    var app = express();
    //improvement preformance
    app.use(compression());

    var http_server = http.createServer(app);

    // Server Settings
    app.set('views',LAYOUT_PATH);
    //app.use(express.logger({ format: ':method :url' }));
    app.use('/es_client',express.static(ES_CLIENT_PATH));
    /*app.use(express.bodyParser());
     app.use(express.cookieParser());*/
    app.use(cookieParser());
    //app.use(bodyParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(cookieSession({secret: 'app_1'}));

    //improvement preformance
    //app.use('view cache', true);

    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Credentials", true);
        res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type");
        next();
    });

    /***********************************************
     * EtherSheet DB Client
     ***********************************************/
    var es = new EtherSheetService(config);

    // listen after setup
    es.onConnect(function(err){
        if(err) throw err;
        http_server.listen(config.port, config.host, function(){
            console.log('ethersheet is listening over http on port ' + config.port);
            process.send({action: "server_online", pid: process.pid});
        });
    });

    /**********************************************
     * HTTP Routes
     *********************************************/
    //index
    app.get('/', function(req,res){
        res.render('index.ejs', {introText: config.intro_text});
    });

    //convert sheet to csv
    app.get('/s/:sheetid.csv', function(req,res){
        var sheet_id = String(req.params.sheetid);

        if(!req.cookies || !req.cookies.JSESSIONID == sheet_id){
            console.log('req.cookies', req.cookies);
            res.cookie('JSESSIONID', sheet_id, { maxAge: 900000, httpOnly: false});
            res.redirect("/s/" + sheet_id);
        }

        es.sheetToCSV(sheet_id,function(err, sheet_data){
            //res.header('content-type', 'text/csv');
            //res.render('csv.ejs',{ csv:sheet_data});
            //ISISLab fantasy
            res.header('content-type', 'text/csv; charset=utf-8');
            res.send(sheet_data);
            //End ISISLab fantasy
        });
    });

    //load up the sheet
    app.get('/s/:collection_id', function(req,res){
        var collection_id = String(req.params.collection_id);

        http_server.collection_id = collection_id;

        es.getSheetCollection(collection_id,function(err,sheet_data){
            //console.log('sheet_data', sheet_data);
            if(err) return res.send(500,String(err));
            res.render('sheet.ejs',{
                channel:collection_id,
                sheet_collection:JSON.stringify(sheet_data)
            });
        });
    });

    //for test porpouse
    app.get('/sim/:collection_id', function (req,res) {
        var collection_id = String(req.params.collection_id);
        es.getSheetCollection(collection_id,function(err,sheet_data){
            if(err) return res.send(500,String(err));
            res.json(sheet_data);
        });
    });

    //import csv
    app.post('/import/csv', function(req,res){
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files){
            var csv_path = files.csv_file.path;
            var sheet_id = fields.sheet_id;
            fs.readFile(csv_path, function(err, data){
                es.createSheetFromCSV(sheet_id, data, function(err){
                    if(err){
                        res.send(500,err.message);
                        return;
                    }
                    res.redirect('back');
                    pub_server.refreshClients(sheet_id);
                })
            });
        });
    });

    //Upload image from a cell
    //Post files
    app.post('/upload/image', function(req, res)
    {
        res.setHeader('Content-Type', 'application/json');

        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files)
        {
            try {
                var sheet_id = fields.sheet_id;
                var image_name = files.image_file.name;
            }catch(e){
                console.log(e);
                res.send(JSON.stringify({ status: false, massage: "There was an error"}));
            }

            fs.readFile(files.image_file.path, function (err, data)
            {
                /// If there's an error
                if(!image_name)
                {
                    console.log("There was an error");
                    res.send(JSON.stringify({ status: false, massage: "There was an error"}));
                }else{
                    var dir     = __dirname +  "/uploads/" + sheet_id;
                    if (!fs.existsSync(dir)){
                        fs.mkdirSync(dir);
                    }

                    var newPath = dir + "/" + image_name;
                    console.log(newPath);

                    fs.writeFile(newPath, data, function (err) {
                        // let's see it
                        console.log("Image uploaded");
                        var image_url = req.protocol + "://" + req.hostname + ":" + config.port + "/images/" + sheet_id + "/" + image_name;
                        res.send(JSON.stringify({ status: true, massage: "Image uploaded", image_url: image_url}));
                    });
                }
            });
        });
    });

    app.get('/images/:sheet_id/:image', function (req, res) {
        res.sendFile( __dirname +  "/uploads/" +  String(req.params.sheet_id) + "/" +  String(req.params.image));
    });

    app.get('/images/:collection_id', function (req, res){
        var collection_id = String(req.params.collection_id);
        es.getSheetCollectionIds(collection_id, function(err, sheet_ids){
            var images = [];
            fs.readdir(__dirname +  "/uploads/" + sheet_ids[0], function(err, files){
                for(var i in files)
                    images.push(req.protocol + "://" + req.hostname + ":" + config.port + "/images/" + sheet_ids[0] + "/" + files[i]);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({ status: true, massage: "Collection fuond", images: images}));
            });
        })
    });

    /***********************************************
     * PubSub Server
     ***********************************************/
    var killTimeout = null;
    var active_clients = 0;
    var pub_server = new Transactor();
    var transactionHandler = createTransactionHandler(es);

    pub_server.onTransaction(function(channel,socket,command_string,cb){
        var c = new Command(command_string);

        if(c.getDataType()=='user' && c.getAction()=='addUser'){
            var id = c.getParams()[0].id;
            socket.es_user_id = id;
        }
        transactionHandler(c,cb);
    });

    pub_server.onClose(function(channel,socket){
        var close_msg = {
            type:'user',
            action:'removeUser',
            params:[{
                id: socket.es_user_id
            }]
        };
        var close_command = Command.serialize(close_msg);
        pub_server.broadcast(socket,channel,close_command);

        active_clients--;
        delete pub_server.sockets[channel][socket];
        //console.log("CLIENTS: " + active_clients);
        if(active_clients === 0) {
            killTimeout = setTimeout(function () {
                console.log("kill worker");
                process.exit();
            }, 1000 * 60 * 15);
            //process.exit();
        }

        //console.log(active_clients);
    });
    pub_server.refreshClients = function(sheet_id){
        var refresh_msg = {
            type: 'sheet',
            id: sheet_id,
            action: 'refreshSheet',
            params:[]
        }
        var refresh_command = Command.serialize(refresh_msg);
        console.log('sending refresh command');
        pub_server.broadcast(null,sheet_id,refresh_command);
    };


    /***********************************************
     * Websocket Server
     ***********************************************/
    var ws_server = sockjs.createServer();

    ws_server.installHandlers(http_server,{prefix:'.*/pubsub', headers: {'accept': '*/*'}});

    ws_server.on('connection', function(socket){
        var channel = socket.pathname.split('/')[1];
        pub_server.addSocket(channel,socket);
        active_clients++;
        clearTimeout(killTimeout);
        //console.log(active_clients);;
    });

    return http_server;
};
