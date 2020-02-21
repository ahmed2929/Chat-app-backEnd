const express=require('express');
const http=require('http');
const socket =require('socket.io');
const route=require('./route')
const helpers=require('./users');
const cors=require('cors')

const port =process.env.PORT||5000
const app=express();
const server =http.createServer(app);
const io =socket(server);


io.on('connection',(socket)=>{
    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = helpers.addUser({ id: socket.id, name, room });
    
        if(error) return callback(error);
    
        socket.join(user.room);
    
        socket.emit('message', { user: 'AK', text: `${user.name}, welcome to room ${user.room}.`});
        socket.broadcast.to(user.room).emit('message', { user: 'AK', text: `${user.name} has joined!` });
    
        io.to(user.room).emit('roomData', { room: user.room, users:helpers.getUsersInRoom(user.room) });
    
        callback();
      });


      socket.on('sendMessage', (message, callback) => {
        const user = helpers.getUser(socket.id);
    
        io.to(user.room).emit('message', { user: user.name, text: message });
    
        callback();
      });


    socket.on('disconnect',()=>{
       
        const user = helpers.removeUser(socket.id);

        if(user) {
          io.to(user.room).emit('message', { user: 'AK', text: `${user.name} has left.` });
          io.to(user.room).emit('roomData', { room: user.room, users:helpers.getUsersInRoom(user.room)});
        }


    })



})



server.listen(port,()=>{
    console.log('server started on port' + port)
})



app.use(cors());
app.use(route)