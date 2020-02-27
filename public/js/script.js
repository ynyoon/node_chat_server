$(function () {
    const socket = io.connect();
    const $userWrap = $('#userWrap');
    const $contentWrap = $('#contentWrap');
    const $loginForm = $('#loginForm');
    const $joinForm = $('#joinForm');
    const $chatForm = $('#chatForm');
    const $roomSelect = $('#roomSelect');
    const $memberSelect = $('#memberSelect');
    const $chatLog = $('#chatLog');
    let roomId = 1;
    let socketId = "";

    $("#loginBtn").click(function (e) {
        e.preventDefault();
        $loginForm.show();
        $joinForm.hide();
    });

    $("#joinBtn").click(function (e) {
        e.preventDefault();
        $joinForm.show();
        $loginForm.hide();
    });


    $loginForm.submit(function (e) {
        e.preventDefault();
        let id = $("#loginId");
        let pw = $("#loginPw");
        if (id.val() === "" || pw.val() === "") {
            alert("check validation");
            return false;
        } else {
            socket.emit('login user', { id: id.val(), pw: pw.val() }, function (res) {
                console.log('login user : ' + res.result);
                if (res.result) {
                    alert(res.data);
                    socketId = socket.id;
                    roomId = 1;
                    id.val("");
                    pw.val("");
                    $userWrap.hide();
                    $contentWrap.show();
                    $chatLog.html("");
                    $('#chatHeader').html("Everyone");
                } else {
                    alert(res.data);
                    id.val("");
                    pw.val("");
                    $("#joinBtn").click();
                }

                $roomSelect.on("click", "div", function () {
                    if (roomId !== $(this).data('id')) {
                        roomId = $(this).data('id');
                    }
                    $(this).parent().children().removeClass("active");
                    $(this).addClass("active");
                    $chatLog.html("");  //채팅기록 삭제
                    $('#chatHeader').html(`${$(this).html()}`);
                    socket.emit('join room', {
                        roomId
                    });
                });
            });
        }
    });

    $joinForm.submit(function (e) {
        e.preventDefault();
        let id = $("#joinId");
        let pw = $("#joinPw");
        if (id.val() === "" || pw.val() === "") {
            alert("check validation");
            return false;
        } else {
            socket.emit('join user', { id: id.val(), pw: pw.val() }, function (res) {
                console.log("result : " + res.result);
                if (res.result) {
                    alert(res.data);
                    id.val("");
                    pw.val("");
                    $("#loginBtn").click();
                } else {
                    alert(res.data);
                    return false;
                }
            });
        }
    });

    // 4. (c) userlist 이벤트 발생시 memberWrap 에 있는 데이터를 서버한테 받은 데이터로 갱신
    socket.on('userlist', function (data) {
        let html = "";
        data.forEach((el) => {
            if (el.socketId === socketId) {
                html += `<div class="memberEl">${el.name} (me)</div>`
            } else {
                html += `<div class="memberEl">${el.name}</div>`
            }
        });
        $memberSelect.html(html);
    });

    socket.on('lefted room', function (data) {
        $chatLog.append(`<div class="notice"><strong>${data}</strong> lefted the room</div>`)
    });
    socket.on('joined room', function (data) {
        $chatLog.append(`<div class="notice"><strong>${data}</strong> joined the room</div>`)
    });

    socket.on('new message', function (data) {
        if (data.socketId === socketId) {
            $chatLog.append(`<div class="myMsg msgEl"><span class="msg">${data.msg}</span></div>`)
        }else {
            $chatLog.append(`<div class="anotherMsg msgEl"><span class="anotherName">${data.name}</span><span class="msg">${data.msg}</span></div>`)
        }
        $chatLog.scrollTop($chatLog[0].scrollHeight - $chatLog[0].clientHeight);
    });

    $chatForm.submit(function (e) {
        e.preventDefault();
        let msg = $("#message");
        if (msg.val() === "") {
            return false;
        } else {
            let data = {
                roomId: roomId,
                msg: msg.val()
            };
            socket.emit("send message", data);
            msg.val("");
            msg.focus();
        }
    });

});

