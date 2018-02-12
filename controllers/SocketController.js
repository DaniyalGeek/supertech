var sio = require('socket.io');
var io = null;
var messages=[];
exports.io = function () {
    return io;
};

exports.initialize = function(server) {
    io = sio(server);

    io.on('connection', function(socket) {
        console.log('Connection '+socket.id);
        //io.emit('updates', {message:'hahaah'});

        socket.on('disconnect',function () {
            console.log('Dis ');
        });

    });
};