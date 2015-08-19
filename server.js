var express = require('express');
var routes  = require('./routes');
var http    = require('http');
var path    = require('path');

var app     = express();
var server  = http.createServer(app);
var io      = require('socket.io').listen(server);

app.set('port', (process.env.PORT || 5000));
//app.set('host', (process.env.HOST || '127.0.0.1'));

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/public'));
app.use(express.favicon(__dirname +'/public/favicon.ico'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

app.use(function(err, req, res, next) {
	if(!err) return next();
	console.log(err.stack);
	res.json({error: true});
});

app.get('/', routes.index);
app.get('/polls/polls', routes.list);
app.get('/polls/:id', routes.polls);
app.post('/polls', routes.create);
app.post('/vote', routes.vote);

io.sockets.on('connection', routes.vote);

server.listen(app.get('port'), app.get('host'), function(){
//  console.log('App running on '+ app.get('host') + ':' + app.get('port'));
  console.dir(process.env);
  console.log('App running !!!');
});