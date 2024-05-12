const mongoose = require('mongoose');
const dotenv = require('dotenv');
//const { Server } = require('socket.io');

// ---------------------- HANDLE ERROR CATCHING UNCAUGHT EXCEPTIONS ---------------------------- //
// -------- If there is a bug or error occur(happen) in sync code, this will handle it -------- //
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTIONS !!! Shuting down...');
  console.log(err)
  console.log(err.name, err.message);
  process.exit(1);
});

// ---------------------- CONNECT DB ---------------------------- //
dotenv.config({ path: './.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  // .connect(process.env.DATABASE_LOCAL, {
  .connect(DB, {
    // live DB
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log(con.connections);
    console.log('DB connection success');
  });

// ---------------------- START SERVER ---------------------------- //
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// ---------------------- SOCKET IO CONNECT ---------------------------- //
// const io = new Server(server, {
//   cors: { origin: process.env.SERVER_URL+":"+process.env.FRONTEND_PORT },
// });
// io.on('connection', (socket) => {
//   console.log('socket was connect!');
//   console.log(`connect: ${socket.id}`);
//   socket.on('updatePart', (data) => {
//     console.log("masuk eta")
//     socket.broadcast.emit('updatePart',data);
//   });
//   socket.on('dataScan', (data) => {
//     console.log(JSON.parse(data))
//     socket.broadcast.emit('dataScan',data);
//   });
//   socket.on('bebas', () => {
//     socket.broadcast.emit('bebas');
//   });
//   socket.on('updateStatus', (data) => {
//     socket.broadcast.emit('updateStatus',data);
//   });
//   socket.on('order', (data) => {
//     socket.broadcast.emit('order', data);
//   });
//   socket.on('package', (data) => {
//     socket.broadcast.emit('package', data);
//   });
//   socket.on('component', (data) => {
//     socket.broadcast.emit('component', data);
//   });
//   socket.on('station', (data) => {
//     socket.broadcast.emit('station', data);
//   });
//   socket.on('card', (data) => {
//     socket.broadcast.emit('card', data);
//   });
//   socket.on('line', (data) => {
//     socket.broadcast.emit('line', data);
//   });
//   socket.on('realtime', (data) => {
//     socket.broadcast.emit('realtime', data);
//   });
//   socket.on('generateTask', (data) => {
//     console.log('generateTask: ', data);
//     socket.broadcast.emit('generateTask', data);
//   });
// });

// -------------- HANDLE ERROR OUTSIDE EXPRESS: UNDHANDLE REJECTION ----------------- //
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLER REJECTION !!! Shuting down...');
  server.close(() => {
    // doing server.close, we give the server time to finish all the request that are still pending or being handled at the time.
    process.exit(1);
  });
});