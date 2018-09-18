$(function () {
  var socket = io();
  // login part
  socket.emit("login", {
  });

  // login event in chat body
  socket.on("login", function (data) {
    console.log(data);
    $('#sender').attr('value', data.sender);
    $('#color').attr('value', data.color);
    $("#chatBody").append(`<div><strong style="color:${data.color}">${data.sender}</strong> has joined</div>`);
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

