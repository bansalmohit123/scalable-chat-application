import { Server } from 'socket.io';
import dotenv from 'dotenv';
import Redis from 'ioredis';
dotenv.config();

const pub = new Redis({
  host : process.env.REDIS_HOST||'localhost',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  // username: 'root',
  // password: 'root'
});
const sub = new Redis({
  host : process.env.REDIS_HOST||'localhost',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  // username: 'root',
  // password: 'root'

});

class SocketService {
  private _io: Server;

  constructor() {
    console.log('SocketService constructor');
    this._io = new Server({
        cors: {
            origin: '*',
            allowedHeaders: ['*']
        }
    });
    sub.subscribe('MESSAGES');
  }

  public initListeners() {
    const io = this.io;
    console.log('SocketService initListeners');
    io.on('connect', (socket) => {
      console.log('a user connected' , socket.id);

      socket.on('event:message', async ({message}:{message:string})=>{
        console.log("New message: ", message);

        // Publish the message to Redis
        await pub.publish('MESSAGES', JSON.stringify({message}));
      });


    //   socket.on('disconnect', () => {
    //     console.log('user disconnected');
    //   });
    });
    sub.on('message', (channel, message) => {
      console.log('Received message: ', message);
      if (channel === 'MESSAGES'){
        // io.emit('event:message', JSON.parse(message));
        io.emit('message', message);
      }
     
    });
  }

  get io(){
    return this._io;
  }
}

export default SocketService;