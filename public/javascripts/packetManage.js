$(function () {
  var socket = io();
  // login part
  socket.emit("login", {
  });

  // login event in chat body
  socket.on("login", function (data) {
    $('#name').attr('value', data.name);
    $('#color').attr('value', data.color);
    $("#chatBody").append(`<div><strong style="color:${data.color}">${data.name}</strong> has joined</div>`);
    $('#scrollBox')[0].scrollTop = $('#scrollBox')[0].scrollHeight;
  });

  // print message in chat body
  socket.on('msg', function (data) {
    $('#chatBody').append(`<li style="color: ${data.color};">${data.name} - ${data.desc}</li>`);
    $('#scrollBox')[0].scrollTop = $('#scrollBox')[0].scrollHeight;
  });

  socket.on('logout', function (data) {
    $("#chatBody").append(`<div><strong style="color:${data.color}">${data.name}</strong> has left</div>`);
    $('#scrollBox')[0].scrollTop = $('#scrollBox')[0].scrollHeight;
  });
  // submit event on form
  $('#send').submit(function (e) {
    e.preventDefault();
    var desc = $('#desc');

    socket.emit('send', {
      desc: desc.val()
    });

    desc.val('');
  });
});

