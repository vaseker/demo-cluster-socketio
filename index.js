var numCPUs = require('os').cpus().length,
    app = require('express')();

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

var sticky = require('sticky-session');

var redis = require('socket.io-redis');

sticky(numCPUs, function() {
    // This code will be executed only in slave workers

    var http = require('http').Server(app);
    var io = require('socket.io')(http);

    io.adapter(redis({host: 'localhost', port: 6379}));

    io.on('connection', function (socket) {
        console.log('a user connected to PID ' + process.pid);

        socket.on('chat message', function (msg) {
            io.emit('chat message', msg);
        });
    });

    return http;
}).listen(3000, function() {
    console.log('server ' + process.pid + ' started on 3000 port');
});
