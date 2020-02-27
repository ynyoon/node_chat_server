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
    })
});

