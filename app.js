const express = require('express');
const port = process.env.port || 3000;
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server)      //socket.io 를 사용하기 위한 io 객체 생성
let users = {};                                    //기본 회원이 담기는 object
const onlineUsers = {};                                   //현재 online인 회원이 담기는 object

users = { 'admin': { id: 'admin', pw: '1' } };

app.use(express.static('public'));                 //정적파일(css, js...)을 사용하기 위한 path지정

app.get('/', function (req, res) {                    // '/'로 들어오는 요청을 '/chat'으로 리다이렉팅
    res.redirect('/chat');
});

app.get('/chat', function (req, res) {                // '/chat'으로 들어오는 요청은 chat.html을 렌더링
    res.sendfile(__dirname + '/chat.html');
});

server.listen(port, () => {                           //3000 port로 서버 리슨
    console.log(`server listen ${port}`);
});

io.sockets.on('connection', function (socket) {

    socket.on("join user", function (data, cb) {
        if (joincheck(data)) {
            cb({ result: false, data: "이미 존재하는 회원입니다." });
            return false;
        } else {
            users[data.id] = { id: data.id, pw: data.pw };
            cb({ result: true, data: "회원가입에 성공하였습니다." });
        }
    });

    socket.on("login user", function (data, cb) {
        if (loginCheck(data)) {
            onlineUsers[data.id] = { roomId: 1, socketId: socket.id };
            //socket.join('room' + data.roomId);
            socket.join('room1');
            cb({ result: true, data: "로그인에 성공하였습니다." });
            updateUserList(0, 1, data.id);
        } else {
            cb({ result: false, data: "등록된 회원이 없습니다. 회원가입을 진행해 주세요" });
            return false;
        }
    });

    //사용자가 로그아웃 버튼 클릭시 발생
    socket.on('logout', function () {
        if (!socket.id) return;
        let id = getUserBySocketId(socket.id);
        let roomId = onlineUsers[id].roomId;
        delete onlineUsers[getUserBySocketId(socket.id)];
        updateUserList(roomId, 0, id);
    });

    //client와 연결이 끊어졌을때 발생
    socket.on('disconnect', function () {
        if (!socket.id) return;
        let id = getUserBySocketId(socket.id);
        if(id === undefined || id === null){
            return;
        }
        let roomId = onlineUsers[id].rooId || 0;
        delete onlineUsers[getUserBySocketId(socket.id)];
        updateUserList(roomId, 0, id);
    });
    
    // 2. (s) join room 이벤트 발생시 기존에 있던 방에서 나가고 새로운 방에 입장 socket.join()
    // 사용자가 로그인을 했을때 default 로 입장되는 방은 Everyone 이고 이방의 roomId는 1 이므로 로그인 할때 socket.join('room1'); 을 이용해 Everyone 방에 입장하였다.
    // 그리고 join room 이벤트가 발생하면 기존에 있던 방을 떠나고 새로운 방에 join 한다. 그리고 onlineUsers 에 있는 roomId 를 갱신해준다.
    socket.on("join room", function (data) {
        let id = getUserBySocketId(socket.id);
        let prevRoomId = onlineUsers[id].roomId;
        let nextRoomId = data.roomId;
        socket.leave('room' + prevRoomId);
        socket.join('room' + nextRoomId);
        onlineUsers[id].roomId = data.roomId;
        updateUserList(prevRoomId, nextRoomId, id);
    });

    socket.on("send message", function (data) {
        io.sockets.in('room' + data.roomId).emit('new message', {
            name: getUserBySocketId(socket.id),
            socketId: socket.id,
            msg: data.msg
        });
    });

    function joincheck(data) {
        if (users.hasOwnProperty(data.id)) {
            return true;
        } else {
            return false;
        }
    }

    function loginCheck(data) {
        if (users.hasOwnProperty(data.id) && users[data.id].pw === data.pw) {
            return true;
        } else {
            return false;
        }
    }

    function getUserBySocketId(id) {
        return Object.keys(onlineUsers).find(key => onlineUsers[key].socketId === id);
    }

    // 3. (s) 이제 방에 새로운 멤버가 들어왔으니 member list 업데이트 이벤트 발생
    function updateUserList(prev, next, id) {
        if (prev !== 0) {
            io.sockets.in('room' + prev).emit("userlist", getUserByRoomId(prev));
            io.sockets.in('room' + prev).emit("lefted room", id);
        }
        if (next !== 0) {
            io.sockets.in('room' + next).emit("userlist", getUserByRoomId(next));
            io.sockets.in('room' + next).emit("joined room", id);
        }
    }

    function getUserByRoomId(roomId) {
        let userstemp = [];
        Object.keys(onlineUsers).forEach((el) => {
            if (onlineUsers[el].roomId === roomId) {
                userstemp.push({
                    socketId: onlineUsers[el].socketId,
                    name: el
                });
            }
        });
        return userstemp;
    }

    


    // 5. (s) 유저가 disconnect 할때나 로그아웃할 때도 userlist update 이벤트 발생


});