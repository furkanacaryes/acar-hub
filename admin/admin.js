const socket = io.connect('/notifications');


const titleInput = document.getElementById('title-input');
const messageInput = document.getElementById('message-input');
const withButtons = document.getElementById('with-buttons');
const responseInputs = document.getElementsByClassName('input-group');
const publishButton = document.getElementById('publish-button');
const userStack = document.getElementById('user-stack');

let selectedReceivers = [];



withButtons.addEventListener('change', e => {
    responseInputs[0].parentElement.style
        .display = e.target.checked ? 'flex' : 'none'
})


publishButton.addEventListener('click', _ => {
    if(!selectedReceivers)
        return;
    
    const notification = createNotification();

    socket.emit('publish', notification)
})


const createNotification = _ => {
    const notification = {
        receivers: selectedReceivers,
        data: {
            title: titleInput.value,
            message: messageInput.value
        }
    }

    if(!withButtons.checked)
        return notification;

    return addResponseButtons(notification);
}


const addResponseButtons = notification => {
    let buttons = [];

    for(const inputGroup of responseInputs) {
        buttons.push({
            text:  inputGroup.firstElementChild.value,
            value: inputGroup.lastElementChild.value
        })
    }

    notification.data.buttons = buttons;

    return notification;
}


socket.on('session', session => {
    const elem = document.createElement('div');
    elem.classList.add('active-user');

    const uid = document.createElement('div');
    uid.className = 'uid';
    uid.innerHTML = session.user;

    const clientID = document.createElement('code');
    clientID.innerHTML = session.client;

    const timeStamp = document.createElement('div');
    timeStamp.innerHTML = session.timeStamp;
    
    elem.appendChild(uid);
    elem.appendChild(clientID);
    elem.appendChild(timeStamp);

    elem.addEventListener('click', e => {
        const uids = Array.from(userStack.getElementsByClassName('uid'))
            .filter(uid => uid.innerHTML === session.user);

        const isSelected = selectedReceivers
            .find(receiver => receiver === session.user)
    
        if(isSelected)
            selectedReceivers = selectedReceivers
                .filter(receiver => receiver !== session.user)
        else
            selectedReceivers.push(session.user)

        for(const uid of uids)
            uid.parentElement
                .className = isSelected ? 'active-user' : 'active-user selected'

        console.table(selectedReceivers);
    })

    userStack.appendChild(elem);
})


socket.on('sessionOver', rooms => {
    const clientID = Array.from(userStack.getElementsByTagName('code'))
        .find(clientID => clientID.innerHTML === rooms[0]);

    if(!clientID)
        return;

    userStack.removeChild(clientID.parentElement);

    const uids = Array.from(userStack.getElementsByClassName('uid'))
        .filter(uid => uid.innerHTML === rooms[1])
    
    if(!uids.length)
        selectedReceivers = selectedReceivers
            .filter(receiver => receiver !== rooms[1])
})