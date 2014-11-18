var cluster = require('cluster'),
    numCPUs = require('os').cpus().length;

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('socket.io-redis');
io.adapter(redis({host: 'localhost', port: 6379}));


app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
    });
});

if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('disconnect', function (worker) {
        console.error(worker.process.pid + ' disconnected!');
        cluster.fork();
    });

} else {
    http.listen(3000, function () {
        console.log('listening on *:3000');
    });
}
