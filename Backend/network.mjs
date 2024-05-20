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



    this.rooms = [];


  }

  connect(socket) {
    
  }

  disconnect(socket) {
    
  }

  update(dt) {
    
  }
}


export class Client{
    constructor(networkManager, socket){
        this.networkManager = networkManager;
        this.socket = socket;
    }
}

export class Room{
    constructor(networkManager, name){
        this.networkManager = networkManager;
        this.name = name;
        this.clients = [];
    }

    connect(client){
        this.clients.push(client);
    }

    disconnect(client){
        this.clients = this.clients.filter(c => c !== client);
    }
}
