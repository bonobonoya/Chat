// function getToServer() {
//   $.ajax({
//     type: 'POST',
//     url: '/chat/get',
//     data: null,
//     dataType: 'json',
//     success: function(data) {
//       console.log(data);
//       for (i in data) {
//         $('#chatBody').append(`<li style="color: ${data[i].color};">${data[i].sender} - ${data[i].desc}</li>`);
//         $('#scrollBox')[0].scrollTop = $('#scrollBox')[0].scrollHeight;
//       }
//       getToServer();
//     },
//     error: function(ajaxObj, error) {
//       console.log('error', error);
//       getToServer();
//     }
//   });
// }

// function sendToServer() {
//   $.ajax({
//     type: 'POST',
//     url: '/chat',
//     data: {
//       sender: $('#sender').val(),
//       desc: $('#desc').val(),
//       color: $('#color').val()
//     },
//     success: function (data) {
//       $('#desc').val('');
//     }
//   });
//   return false;
// }

$(function () {
  // socket.io 서버에 접속한다
  var socket = io();

  // 서버로 자신의 정보를 전송한다.
  socket.emit("login", {
    sender: $('#sender').val(),
    color: $('color').val()
  });

  // 서버로부터의 메시지가 수신되면
  socket.on("login", function (data) {
    $("#chatBody").append(`<div><strong>${data}</strong> has joined</div>`);
  });

  socket.emit()

  // 서버로부터의 메시지가 수신되면
  socket.on('msg', function (data) {
    $('#chatBody').append(`<li style="color: ${data.color};">${data.sender} - ${data.desc}</li>`);
    $('#scrollBox')[0].scrollTop = $('#scrollBox')[0].scrollHeight;
  });

  // Send 버튼이 클릭되면
  $('form').submit(function (e) {
    e.preventDefault();
    var desc = $('#desc');
    // 서버로 메시지를 전송한다.
    socket.emit('send', {
      sender: $('#sender').val(),
      desc: desc.val(),
      color: $('#color').val()
    });
    desc.val('');
  });
});

function generateUID() {
  // I generate the UID from two parts here 
  // to ensure the random number provide enough bits.
  var firstPart = (Math.random() * 46656) | 0;
  var secondPart = (Math.random() * 46656) | 0;
  firstPart = ("000" + firstPart.toString(36)).slice(-3);
  secondPart = ("000" + secondPart.toString(36)).slice(-3);
  return firstPart + secondPart;
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}