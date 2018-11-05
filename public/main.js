const socket = io.connect('/notifications');


const loginButton = document.getElementById('login');
const stack = document.getElementById('notification-stack');


loginButton.addEventListener('click', () => {
    fetch('/login')
        .then(res => res.json())
        .then(json => subscribeNotifications(json.token))
})


const subscribeNotifications = token => {
    socket.emit('join', token);
}


socket.on('notify', notification => {
    const elem = createNotificationElement(notification);
    stack.appendChild(elem);
})


const createNotificationElement = notification => {
    const elem = document.createElement('div');
    elem.classList.add('notification');

    const heading = document.createElement('h5');
    heading.innerHTML = notification.title;

    const message = document.createElement('p');
    message.innerHTML = notification.message;

    elem.appendChild(heading);
    elem.appendChild(message);

    if (!notification.buttons)
        return elem;

    for (const button of notification.buttons) {
        const buttonElem = document.createElement('div');
        buttonElem.classList.add('button');
        buttonElem.innerHTML = button.text;
        buttonElem.addEventListener('click', clickEvent(button.value));
    }

    return elem;
}


const clickEvent = value => {
    socket.emit('NotificationResponse', button.value)
}


socket.on('message', console.log)