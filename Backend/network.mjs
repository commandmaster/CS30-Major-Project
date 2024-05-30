export class NetworkManager {
  constructor(engine, io) {
    this.engine = engine;
    this.io = io;

    this.io.on('connection', (socket) => {
      console.log('a user connected');
      this.connect(socket);
      socket.on('disconnect', () => {
        this.disconnect(socket);
      });
    }); 

    this.clients = {};
  }

  connect(socket) {
    this.clients[socket.id] = new Client(this, socket);
  }

  disconnect(socket) {
    delete this.clients[socket.id];
  }

  start() {
    
  } 

  update(dt) {
    
  }
}


class Client{
    constructor(networkManager, socket){
        this.networkManager = networkManager;
        this.socket = socket;
    }
}


