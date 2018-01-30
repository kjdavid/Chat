let MongoClient = require('mongodb').MongoClient,
clientold = require('socket.io').listen(8080).sockets;
MongoClient.connect('mongodb://127.0.0.1', function(err, client) {
    if (err) throw err;
    
        clientold.on('connection', function(socket){
        var db = client.db('chat'),
            col = db.collection('messages'),
            sendStatus = function(s){
                socket.emit('status', s);
            };
        //Emit messages
        
            col.find().limit(100).sort({_id: 1}).toArray(function( err, res){
                if(err) throw err;
                socket.emit('output', res);
            });

        //waiting for input
        socket.on('input', function(data){
            var name = data.name,
                message = data.message,
                whitespacePattern = /^\s*$/;
                if(whitespacePattern.test(name) || whitespacePattern.test(message)){
                    sendStatus('Name and message is required.');
                }else{
                    db.collection('messages').save({name: name, message: message}, function(){
                    
                    clientold.emit('output', [data]);
                    
                    sendStatus({
                        message: "Message sent",
                        clear: true
                    });
                });
            }
        });
    });
});