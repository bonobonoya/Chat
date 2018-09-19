$(function () {
  var socket = io();
  // login part
  socket.emit("login", {
  });

  // login event in chat body
  socket.on("login", function (data) {
    $('#name').attr('value', data.name);
    $('#color').attr('value', data.color);
    $("#chatBody").append(`<div style="text-align: center;">--- <strong style="color:${data.color}">${data.name}</strong> has joined ---</div>`);
    $('#scrollBox')[0].scrollTop = $('#scrollBox')[0].scrollHeight;
  });

  // print message in chat body
  socket.on('msg', function (data) {
    $('#chatBody').append(`<div style="color: ${data.color};">${data.name} - ${data.desc}</div>`);
    $('#scrollBox')[0].scrollTop = $('#scrollBox')[0].scrollHeight;
  });

  socket.on('logout', function (data) {
    $("#chatBody").append(`<div style="text-align: center;">--- <strong style="color:${data.color}">${data.name}</strong> has left ---</div>`);
    $('#scrollBox')[0].scrollTop = $('#scrollBox')[0].scrollHeight;
  });

  socket.on('changeName', function (data) {
    if (data.error) {
      return alert(data.error);
    }
    $("#chatBody").append(`<div style="text-align: center;">--- 
      <strong style="color:${data.color}">${data.before}</strong>'s
      change name to <strong style="color:${data.color}">${data.after}</strong>
       ---</div>`);
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

  $('#change').submit(function (e) {
    e.preventDefault();
    var desc = $('#desc');

    socket.emit('send', {
      desc: desc.val()
    });

    desc.val('');
  });

  $('#changeName').submit(function (e) {
    e.preventDefault();

    socket.emit('changeName', {
      name: $('#name').val()
    });
  })
});

