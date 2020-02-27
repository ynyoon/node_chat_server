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