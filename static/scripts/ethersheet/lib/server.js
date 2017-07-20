var http = require('http');
var express = require('express');

var sockjs = require('sockjs');
//var engineio = require('engine.io');

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
var _ = require('underscore');

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
    app.get('/export/s/:sheetid.csv', function(req,res){
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
                        //var image_url = req.protocol + "://" + req.hostname + ":" + require('../config').port + "/images/" + sheet_id + "/" + image_name;
                        var image_url = req.protocol + "://" + req.hostname + "/ethersheet/images/" + sheet_id + "/" + image_name;
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
                    //images.push(req.protocol + "://" + req.hostname + ":" + require('../config').port + "/images/" + sheet_ids[0] + "/" + files[i]);
                    images.push(req.protocol + "://" + req.hostname + "/ethersheet/images/" + sheet_ids[0] + "/" + files[i]);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({ status: true, massage: "Collection fuond", images: images}));
            });
        })
    });

    //Media room
    //utility function
    function updateCell( sheet_ids, sheet, col_idx, value ){

        var add_cell_command = new Command('{"id":"C8JyNCNmA5dAqTnAcD",' +
            '"type":"selection",' +
            '"action":"addCell",' +
            '"params":["' + sheet_ids + '","'
            + sheet.rows[0] + '","' +
            + sheet.cols[col_idx] + '"]}');

        var commit_cell = new Command('{"id":"' + sheet_ids + '",' +
            '"type":"sheet",' +
            '"action":"commitCell",' +
            '"params":["' + sheet.rows[0] + '","'
            + sheet.cols[col_idx] + '",' +
            '{"value":"' + value + '","type":"string"}]}');

        setTimeout(function () {
            transactionHandler(add_cell_command, function(err){
                pub_server.broadcast(null,sheet_ids, add_cell_command);

                setTimeout(function () {
                    transactionHandler(commit_cell, function(err){
                        pub_server.broadcast(null,sheet_ids, commit_cell);
                    })
                }, 300);
            })
        }, 300);

    };

    app.post('/mediaroom/init', function(req, res){
        res.setHeader('Content-Type', 'application/json');
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
            try{
                var collection_id = fields.collection_id;
                console.log(fields);
                console.log("COLLECTION: " + collection_id);
                es.getSheetCollectionIds(collection_id, function(err, sheet_ids) {
                    es.getSheet(sheet_ids[0], function(err, sheet) {
                        //console.log(sheet.rows);
                        var headers = ["Title", "Description", "Image", "Location", "Date"];
                        _.each(headers, function(h, idx){
                            console.log(h + " - " + sheet.rows[0] + " - " + sheet.cols[idx]);
                            updateCell(sheet_ids[0], sheet, idx, h)
                        });
                        //send response
                        res.send(JSON.stringify({
                            status: true,
                            message: "Media room initialized"
                        }));
                    });
                });
            }catch(e){
                console.log(e);
                res.send(JSON.stringify({status: false, message: "There was an error"}));
            }
        });
    });

    //Add new row in the related sheet
    app.post('/mediaroom/addrow', function(req, res)
    {
        //console.log("ADD ROW SERVICE CALLED");
        res.setHeader('Content-Type', 'application/json');

        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
            try {
                var collection_id = fields.sheetId;
                var row  = {
                    title       : fields.title,
                    description : fields.description,
                    image_name  : files.image_file.name,
                    location    : fields.location,
                    date        : fields.date
                };
                es.getSheetCollectionIds(collection_id, function(err, sheet_ids) {
                    //Save image file
                    fs.readFile(files.image_file.path, function (err, data) {
                        /// If there's an error
                        if (!row.image_name) {
                            console.log("There was an error");
                            res.send(JSON.stringify({status: false, message: "There was an error"}));
                        } else {
                            var dir = __dirname + "/uploads/" + sheet_ids[0];
                            if (!fs.existsSync(dir)) {
                                fs.mkdirSync(dir);
                            }

                            var newPath = dir + "/" + row.image_name;
                            console.log(newPath);

                            fs.writeFile(newPath, data, function (err) {
                                // let's see it
                                console.log("Image uploaded");

                                //add row
                                es.getSheet(sheet_ids[0], function(err, sheet) {
                                    console.log(Object.keys(sheet.cells).length);
                                    var row_ids = Object.keys(sheet.cells);
                                    var model = es.getModel("sheet",sheet_ids[0]);

                                    var new_row_id = null;
                                    if (row_ids.length === sheet.rows.length) {
                                        new_row_id = require('../node_modules/es_client/helpers/uid')();
                                        var c = new Command('{"id":"' + sheet_ids[0] +
                                            '","type":"sheet",' +
                                            '"action":"insertRow",' +
                                            '"params":[' + (row_ids.length + 1) + ',"' + new_row_id + '"]}'
                                        );
                                        c.execute(model, function(err){ });
                                    }else{
                                        new_row_id = sheet.rows[row_ids.length];
                                    }

                                    row.image_name = req.protocol + "://" + req.hostname + "/ethersheet/images/" + sheet_ids[0] + "/" + row.image_name;

                                    _.each(Object.keys(sheet.cells[row_ids[0]]), function(col, idx){
                                        console.log( new_row_id + " - " + col + " - " + row[Object.keys(row)[idx]] );
                                        var c = new Command('{"id":"' + sheet_ids[0] + '",' +
                                            '"type":"sheet",' +
                                            '"action":"commitCell",' +
                                            '"params":["' + new_row_id + '","'
                                            + col + '",' +
                                            '{"value":"' + row[Object.keys(row)[idx]] + '","type":"string"}]}');

                                        setTimeout(function () {
                                            //c.execute(model, function(err){ });
                                            transactionHandler(c, function(err){
                                                pub_server.broadcast(null,sheet_ids[0],c);
                                            })
                                        }, 100);

                                    });

                                    //send response
                                    res.send(JSON.stringify({
                                        status: true,
                                        message: "Row added"
                                    }));

                                });
                            });
                        }
                    });
                });

            } catch (e) {
                console.log(e);
                res.send(JSON.stringify({status: false, message: "There was an error"}));
            }
        });
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

    //var ws_server = engineio.attach( http_server, { transports :['polling'] } );

    ws_server.on('connection', function(socket){
        //var channel =  socket.request.headers.referer.split('/')[4];
        var channel = socket.pathname.split('/')[1];
        //console.log("new connection channel: " + channel);
        pub_server.addSocket(channel,socket);
        active_clients++;
        clearTimeout(killTimeout);
        //console.log(active_clients);;
    });

    return http_server;
};
