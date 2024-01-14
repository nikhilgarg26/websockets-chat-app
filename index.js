const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { v4: uuidv4 } = require('uuid');
const express = require("express")
const path = require("path")

const app = express()
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.get('/',(req,res)=>{
  res.sendFile(path.join(__dirname, '/index.html'));
})

var rooms = new Map()

wss.on('connection', function (ws) {
  console.log('Started new client');

  ws.on('error', (err) => {
    console.log("error")
    console.log(err)
  });


  ws.onmessage=((message) => {
    messageHandler(JSON.parse(message.data), ws)
  })

});

server.listen(8080, function () {
  console.log('Listening on http://localhost:8080');
});

function messageHandler(message, websocket) {
  const roomid = message.roomid
  const userid = message.userid
  const name = message.name
  const msg = message.msg

  const user = {
    userid,
    name,
    websocket
  }

  if (!msg) {

    if (!roomid) {
      console.error("No room id")
      return
    }

    if (!rooms.get(roomid)) {
      rooms.set(roomid, { users: [], chats: [] })
    }

    if (rooms.get(roomid).users.find((user) => user.userid === userid)) {
      console.error("User already exists in that room")
      return
    }

    rooms.get(roomid).users.push(user)

    broadcast(roomid, userid, {name: name, msg: `${name} joined the room now.`})

    websocket.on('close', (reasonCode, description) => {
      const index = rooms.get(roomid).users.indexOf(user)
      rooms.get(roomid).users.splice(index, 1)
    });
  }
  else {
    const chatid = uuidv4()

    if (!roomid) {
      console.error("No room id")
      return
    }

    const chat = {
      chatid,
      userid,
      name,
      msg
    }

    rooms.get(roomid).chats.push(chat)

    broadcast(roomid, userid, chat)
  }

}

function broadcast(roomid, userid, chat) {
  const users = rooms.get(roomid).users

  users.forEach((user) => {
    if (user.userid === userid) return

    user.websocket.send(JSON.stringify(chat))
  });
}



// const room = {
//   roomid,
//   user: {
//     userid,
//     name,
//     websocket
//   },
//   chat :{
//     chatid,
//     name,
//     userid,
//     message
//   }
// }
