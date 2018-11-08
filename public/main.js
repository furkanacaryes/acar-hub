const socket = io.connect('/notifications');

const unameInput  = document.getElementById('uname-input');
const loginButton = document.getElementById('login-button');
const stack       = document.getElementById('notification-stack');

const vanishAnimationDuration = 600;

let token = null;



loginButton.addEventListener('click', _ => {
    if(!unameInput.value)
        return;
    
    fetch('/login', {
        method: 'POST',
        body: JSON.stringify({
            username: sanitizeInput(unameInput.value)
        })
    })
        .then(res => res.json())
        .then(json => {
            token = json.token;
            subscribeNotifications(json.token)
        })
})


const sanitizeInput = input => {
    let div = document.createElement('div');
    div.appendChild(document.createTextNode(input));
    let text = div.innerHTML;

    div = document.createElement('div');
    div.innerHTML = text;
    const child = div.childNodes[0];

    console.warn('Sanitized!', child);

    return child ? child.nodeValue : '';
}


const subscribeNotifications = token => {
    socket.emit('join', token);
}


socket.on('notify', notification => {
    const elem = createNotificationElement(notification);
    stack.appendChild(elem);
    sayGoodBye(elem, 3000);
})


const createNotificationElement = notification => {
    const elem = document.createElement('div');
    elem.classList.add('notification', `io${new Date().getMilliseconds()}`);

    const heading = document.createElement('h5');
    heading.innerHTML = notification.title;

    const message = document.createElement('p');
    message.innerHTML = notification.message;

    elem.appendChild(heading);
    elem.appendChild(message);

    if (!notification.buttons)
        return elem;

    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('button-group');
    elem.appendChild(buttonGroup);

    for (const button of notification.buttons) {
        const buttonElem = document.createElement('div');
        buttonElem.classList.add('button', 'button--notification');
        buttonElem.innerHTML = button.text;
        addNotifyOnClickEvent(elem, buttonElem, {
            value: button.value,
            sender: token
        });

        buttonGroup.appendChild(buttonElem);
    }

    return elem;
}


const addNotifyOnClickEvent = (elem, buttonElem, response) => {
    buttonElem.addEventListener('click', _ => {
        socket.emit('NotificationResponse', response);
        sayGoodBye(elem, 0)
    })
}


const sayGoodBye = (elem, visibleDuration) => {
    const DOMElem = document.querySelector(`.${elem.classList[1]}`);

    clearTimeout(elem.visibleTimeout);
    clearTimeout(elem.vanishTimeout);

    elem.visibleTimeout = setTimeout(_ => {
        DOMElem.classList.add('leave')
    }, visibleDuration);

    elem.vanishTimeout = setTimeout(_ => {
        stack.removeChild(DOMElem)
    }, visibleDuration + vanishAnimationDuration)
}


socket.on('message', message => {
    console.log(message);
})