const express = require('express');
const port = process.env.port || 3000;
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server)      //socket.io 를 사용하기 위한 io 객체 생성
const users = {};                                    //기본 회원이 담기는 object
const onlineUsers = {};                                   //현재 online인 회원이 담기는 object

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

    function joincheck(data) {
        if (users.hasOwnProperty(data.id)) {
            return true;
        } else {
            return false;
        }
    }

    socket.on("login user", function (data, cb) {
        if (loginCheck(data)) {
            onlineUsers[data.id] = { roomId: 1, socketId: socket.id };
            socket.join('room' + data.roomId);
            console.log("data.roomId :" + data.roomId);
            cb({ result: true, data: "로그인에 성공하였습니다." });
        } else {
            cb({ result: false, data: "등록된 회원이 없습니다. 회원가입을 진행해 주세요" });
            return false;
        }
    });

    function loginCheck(data) {
        if (users.hasOwnProperty(data.id) && users[data.id].pw === data.pw) {
            return true;
        } else {
            return false;
        }
    }

    //사용자가 로그아웃 버튼 클릭시 발생
    socket.on('logout', function () {
        if (!socket.id) return;
        delete onlineUsers[getUserBySocketId(socket.id)];
    });

    //client와 연결이 끊어졌을때 발생
    socket.on('disconnect', function () {
        if (!socket.id) return;
        delete onlineUsers[getUserBySocketId(socket.id)];
    });

    function getUserBySocketId(id) {
        return Object.keys(onlineUsers).find(key => onlineUsers[key].socketId === id);
    }

});