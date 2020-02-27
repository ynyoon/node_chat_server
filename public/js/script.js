$(function(){
    const $loginForm = $('#loginForm');
    const $joinForm = $('#joinForm');

    $("#loginBtn").click(function(e){
        e.preventDefault();
        $loginForm.show();
        $joinForm.hide();
    });

    $("#joinBtn").click(function(e){
        e.preventDefault();
        $joinForm.show();
        $loginForm.hide();
    });

    const socket = io.connect();
    let roomId = 1;
    let socketId = "";
    const $userWrap = $('#userWrap');
    const $contentWrap = $('#contentWrap');

    $loginForm.submit(function (e) {
        e.preventDefault();
        let id = $("#loginId");
        let pw = $("#loginPw");
        if (id.val() === "" || pw.val() === "") {
            alert("check validation");
            return false;
        } else {
            socket.emit('login user', {id: id.val(), pw: pw.val()}, function (res) {
                console.log('login user : ' + res.result);
                if (res.result) {
                    alert(res.data);
                    socketId = socket.id;
                    roomId = 1;
                    id.val("");
                    pw.val("");
                    $userWrap.hide();
                    $contentWrap.show();
                } else {
                    alert(res.data);
                    id.val("");
                    pw.val("");
                    $("#joinBtn").click();
                }
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
            socket.emit('join user', {id: id.val(), pw: pw.val()}, function (res) {
                console.log("result : " +res.result);
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
});

