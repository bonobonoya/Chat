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
  var socket = io();

  // login part
  socket.emit("login", {
    sender: $('#sender').val(),
    color: $('color').val()
  });

  // login event in chat body
  socket.on("login", function (data) {
    $("#chatBody").append(`<div><strong>${data}</strong> has joined</div>`);
  });

  // print message in chat body
  socket.on('msg', function (data) {
    $('#chatBody').append(`<li style="color: ${data.color};">${data.sender} - ${data.desc}</li>`);
    $('#scrollBox')[0].scrollTop = $('#scrollBox')[0].scrollHeight;
  });

  // submit event on form
  $('form').submit(function (e) {
    e.preventDefault();
    var desc = $('#desc');

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

// for writing
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}