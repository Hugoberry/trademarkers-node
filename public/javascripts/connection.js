// $( document ).ready(function() {

//   connectionUpdate('Requesting JWT Token from Laravel');

//   $.ajax({
//       url: 'http://trademarkers.staging.test/token',
//       xhrFields: {
//           withCredentials: true
//       }
//   })
//   .fail(function (jqXHR, textStatus, errorThrown) {
//       connectionUpdate('Could not retrieve token: ' + textStatus);
//   })
//   .done(function (result, textStatus, jqXHR) {
//       connectionUpdate('Got token: ' + result.token + ', connect to SocketIO');

//       var socket = io.connect('http://localhost:4200');
//       socket.on('connect', function () {
//           connectionUpdate('Connected to SocketIO, Authenticating')
//           socket.emit('authenticate', {token: result.token});
//       });

//       socket.on('authenticated', function () {
//           connectionUpdate('Authenticated');
//       });

//       socket.on('unauthorized', function (data) {
//           connectionUpdate('Unauthorized, error: ' + data.message);
//       });

//       socket.on('disconnect', function () {
//           connectionUpdate('Disconnected');
//       });

//       socket.on('name', function (data) {
//           $('#name').html(data);
//       });

//       socket.on('email', function (data) {
//           $('#email').html(data);
//       });
//   });



// });

// function connectionUpdate(str) {
//   $('#connection').html(str);
//   console.log(str);
// }