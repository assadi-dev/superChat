const express = require("express");
const app = express();
const server = require("http").createServer(app);
const path = require("path");
const io = require("socket.io")(server, { cors: { origin: "*" } });
const session = require("express-session")({
  secret: "my-secret",
  resave: true,
  saveUninitialized: true,
});
const sharedsession = require("express-socket.io-session");

const port = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, "/public")));
app.get("/", (__, res) => {
  res.sendFile(`${__dirname}/public.html`);
});

var listMessage = [];

//Create session
io.use(
  sharedsession(session, {
    autoSave: true,
  })
);

// Quand un client se connecte, on le note dans la console
io.on("connection", (socket) => {
  //reception du pseudo client
  socket.on("visiteur", (pseudo) => {
    socket.handshake.session.pseudo = pseudo;
    socket.handshake.session.save();

    //Alerté tous les utilisateurs connecté
    if (!socket.handshake.session.pseudo == "") {
      socket.broadcast.emit("annonce", socket.handshake.session.pseudo);
    }
  });

  socket.on("logout", (pseudo) => {
    socket.broadcast.emit("leave", pseudo);

    if (socket.handshake.session.pseudo) {
      delete socket.handshake.session.pseudo;
      socket.handshake.session.save();
    }
  });

  //detection des visiteur connecté
  socket.emit("welcome", "Bonjour" + socket.handshake.session.pseudo);

  //reception des messages du client
  socket.on("message", (message) => {
    const data = { author: socket.handshake.session.pseudo, message: message };
    socket.broadcast.emit("message", data);
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
