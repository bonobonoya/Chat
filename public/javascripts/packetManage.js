$(() => {
  const socket = io();
  // login part
  socket.emit('login', {});

  // login event in chat body
  socket.on('login', (data) => {
    $('#name').attr('value', data.name);
    $('#color').attr('value', data.color);
    $('#chatBody').append(`<div style="text-align: center;">
      --- <strong style="color:${data.color}">${data.name}</strong> has joined ---
      </div>`);
    $('#scrollBox')[0].scrollTop = $('#scrollBox')[0].scrollHeight;
  });

  socket.on('updateUserList', (data) => {
    $('#userListBody').html('');
    $('#userListBody').append(`<div>Total: ${data.length}</div>`);
    data.forEach((x) => {
      $('#userListBody').append(`<div style="color:${x.color}">${x.name}</div>`);
    });
  });

  // print message in chat body
  socket.on('msg', (data) => {
    $('#chatBody').append(`<div style="color: ${data.color};">${data.name} - ${data.desc}</div>`);
    $('#scrollBox')[0].scrollTop = $('#scrollBox')[0].scrollHeight;
  });

  socket.on('logout', (data) => {
    $('#chatBody').append(`<div style="text-align: center;">
      --- <strong style="color:${data.color}">${data.name}</strong> has left ---
      </div>`);
    $('#scrollBox')[0].scrollTop = $('#scrollBox')[0].scrollHeight;
  });

  socket.on('changeName', (data) => {
    if (data.error) {
      alert(data.error);
    }
    $('#chatBody').append(`<div style="text-align: center;">
      --- <strong style="color:${data.color}">${data.before}</strong>'s
      change name to <strong style="color:${data.color}">${data.after}</strong> ---
      </div>`);
  });

  // submit event on form
  $('#send').submit((e) => {
    e.preventDefault();
    const desc = $('#desc');

    socket.emit('send', {
      desc: desc.val(),
    });

    desc.val('');
  });

  $('#change').submit((e) => {
    e.preventDefault();
    const desc = $('#desc');

    socket.emit('send', {
      desc: desc.val(),
    });

    desc.val('');
  });

  $('#changeName').submit((e) => {
    e.preventDefault();

    socket.emit('changeName', {
      name: $('#name').val(),
    });
  });
});
