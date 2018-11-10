const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mongoDB_URL = 'mongodb://nodejs_02:123qwe@ds052649.mlab.com:52649/nodejs_02';
const session = mongoose.model('session', {
    title: String,
    message: String,
    buttons: []
})
const port = process.env.PORT || 3000;


app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


server.listen(port, _ => {
    console.log('Server is Up!', port);
})


mongoose.connect(mongoDB_URL, {useNewUrlParser: true}, err => {
    if(err)
        console.log('MongoDB Couldn\'t Connect!')
    
    console.log('MongoDB Connection Established.')
})


app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`)
})


app.get('/admin', (req, res) => {
    res.sendFile(`${__dirname}/admin/index.html`)
})


app.get('/resources/:component/:resource', (req, res) => {
    res.sendFile(`${__dirname}/${req.params.component}/${req.params.resource}`)
})


app.post('/login', (req, res) => {
    const data = JSON.parse(req.body);
    // ...
    // login()
    // ...
    res.status(200).send({token: data.username});
})


const notifications = io.of('/notifications');


notifications.on('connection', socket => {
    console.log('New Connection!');

    // notification object is received from admin and contains data
    // to create a notification element on clients
    socket.on('publish', notification => {
        for (const receiver of notification.receivers)
            notifications.to(receiver)
                .emit('notify', notification.data)
    })

    
    // Encapsulates Clients based on their unique data
    // In this case their usernames

    socket.on('join', room => {
        socket.join(room);
        console.log(`New Client Joined and Encapsulated as ${room}`);

        const newSession = {
            user: room,
            client: Object.keys(socket.rooms).join(' '),
            timeStamp: new Date()
        };

        // Keep persistent

        session.create(newSession, err => {
            console.log('Session Couldn\'t Save!')
        });


        // Informs Admin Client to make changes on UI

        notifications.emit('session', newSession)
    })


    // response object is received from client and contains a value to act upon.

    socket.on('NotificationResponse', response => {

        // Needs Operation Helper to determine which action to take.
        // This is a binary action sample.

        if (response.value === 'true') {
            console.log(`${response.sender} Accepted! Saving...`);
            notifications.to(response.sender).emit('message', 'Saved!')
        } else {
            console.log(`${response.sender} Declined Canceling...`);
            notifications.to(response.sender).emit('message', 'Canceled!')
        }
    })


    socket.on('disconnecting', _ => {
        session.findOneAndDelete({
            client: Object.keys(socket.rooms).join(' ')},
            err => {
                if(err)
                    console.log('Couldn\'t Delete!', err)
            })

        // Informs Admin Client to make changes on UI

        console.log('Disconnect Raised!');
        notifications.emit('sessionOver', Object.keys(socket.rooms))
    })
})