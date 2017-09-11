var express = require('express');
var app 	= express();
var server 	= require('http').createServer(app);
var io 		= require('socket.io').listen(server);

var redis = require('redis');
var redisClient = redis.createClient();
var storeMessage = function(name, data){
    //need to turn object into string to store in redis
    var message = JSON.stringify({name: name, data: data});
    redisClient.lpush("messages", message, function(err, response) {
        redisClient.ltrim("messages", 0, 9);
    });
};

io.sockets.on('connection', function(client) {
    console.log('client connected');

    client.on('messages', function (message) {
        var name = client.name;
        client.broadcast.emit("messages", name + " : " + message);
        client.emit("messages", name + " : " + message);
        storeMessage(name, message);
    });

    client.on('join', function (name) {
        client.name = name;
        redisClient.lrange("messages",0, -1, function (err, messages) {
            messages = messages.reverse();
            messages.forEach(function (message) {
                message = JSON.parse(message);
                client.emit("messages", message.name + " : " + message.data);
            });
        });
        redisClient.sadd("chatters", name);
        redisClient.smembers('chatters', function(err, names) {
            names.forEach(function(name){
                client.emit('add chatter', name);
            });
        });
        client.broadcast.emit("add chatter", name);
    });

    client.on('disconnect', function(){
        client.broadcast.emit("remove chatter", client.name);
        redisClient.srem("chatters", client.name);
    });
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

server.listen(9000);

