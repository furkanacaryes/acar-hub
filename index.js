const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = 3000;



server.listen(port, () => {
    console.log('Server is Up!', port);
})



app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
})


app.get('/resources/:resource', (req, res) => {
    res.sendFile(`${__dirname}/public/${req.params.resource}`)
})


app.get('/login', (req, res) => {
    res.status(200).send({token: 'johnDoe1453xdxd'})
})


const notifications = io.of('/notifications');


notifications.on('connection', socket => {
    console.log('New Connection!');
    
    socket.on('join', room => {
        socket.join(room);
        console.log(`New Client Joined and Encapsulated as ${room}`);
    })


    socket.on('NotificationResponse', response => {
        if (response.value) {
            console.log(`${socket.rooms[0].id} Accepted! Saving...`);
            notifications.to(socket.rooms[0].id).emit('message', 'Saved!')
        } else {
            console.log(`${socket.rooms[0].id} Declined Notification Prompt.`);
            notifications.to(socket.rooms[0].id).emit('message', 'Canceled!')
        }
    })


    socket.on('disconnect', () => {
        console.log('Disconnect Raised!');
        notifications.emit('log', 'Disconnect Raised!')
    })

    setTimeout(_ => notifications.to('johnDoe1453xdxd')
        .emit('notify', {
            title: 'Test Notification',
            message: 'Do you even code bruh?',
            buttons: [
                { text: 'Accept', value: true },
                { text: 'Decline', value: false }
            ]
        }), 3000)
})