import { Server } from 'socket.io';
import dotenv from 'dotenv';
import Redis from 'ioredis';
import prismaClient from './prisma';
import {produceMessage} from './kafka'
dotenv.config();

const pub = new Redis({
  host: process.env.REDIS_HOST || undefined,
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : undefined,
  username: 'default',
  password: process.env.REDIS_PASSWORD,

});

pub.on('connect', () => {
  console.log('Publisher connected to Redis');
});

pub.on('error', (err) => {
  console.error('Redis Publisher Error: ', err);
});

const sub = new Redis({
  host: process.env.REDIS_HOST || undefined,
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : undefined,
  username: 'default',
  password: process.env.REDIS_PASSWORD,

});

sub.on('connect', () => {
  console.log('Subscriber connected to Redis');
});

sub.on('error', (err) => {
  console.error('Redis Subscriber Error: ', err);
});

sub.on('subscribe', (channel, count) => {
  console.log(`Subscribed to ${channel}, currently subscribed to ${count} channels.`);
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
    sub.on('message', async (channel, message) => {
      console.log('Received message: ', message);
      if (channel === 'MESSAGES'){
        // io.emit('event:message', JSON.parse(message));
        io.emit('message', message);
         await produceMessage(message);
         console.log('Message sent to Kafka');
      }
     
    });
  }

  get io(){
    return this._io;
  }
}

export default SocketService;