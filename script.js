let loginForm = document.getElementById("loginForm");

const socket = new WebSocket("ws://localhost:8080");

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    var userid = document.getElementById('username')
    var name = document.getElementById('name')

    document.getElementById('welcome').innerHTML = `Welcome ${name.value}`

    document.getElementById('loginForm').classList.add("disable");
    document.getElementById('chatarea').removeAttribute('disabled')

    const msg = {
        roomid: 202,
        userid: userid.value,
        name: name.value,
        msg: ""
    };

    socket.send(JSON.stringify(msg))

    let sendChat = document.getElementById("sendChat")

    sendChat.addEventListener("submit", (e) => {
        e.preventDefault();

        var chat = document.getElementById('chatinput')
        msg.msg = chat.value

        socket.send(JSON.stringify(msg))
        outputMessage({ name: name.value, msg: chat.value })

        chat.value = ""

    })

    socket.onmessage = (event) => {
        outputMessage(JSON.parse(event.data));
    };
});

function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = ` <p class="meta">${message.name} <span></span></p>
    <p class="text">
       ${message.msg}
    </p>`;

    document.querySelector('.chat-messages').appendChild(div);
}

