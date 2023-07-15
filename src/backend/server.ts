import express from 'express';
import http from 'http'
import { Server, ServerOptions, Socket } from 'socket.io'
import { gameState, initGame, startGameInterval, updateVelocity } from '../core/gameState.js';
import { ClientRoom, ClientToServerEvents, ExtendedSocket, RoomStates, ServerToClientEvents } from '../core/interfaces.js';
import { makeId } from './utils.js';

const port: number = Number(process.env.PORT) || 3000;

class App {
    private server: http.Server;
    private port: number;
    private roomStates : RoomStates = {};
    private clientRooms : ClientRoom = {};
    
    constructor(port: number) {
        this.port = port;
        const app = express();

        this.server = new http.Server(app);

        const io = new Server<
            ClientToServerEvents,
            ServerToClientEvents,
            gameState
        >(this.server, {
            cors: {
                origin:'*',
                credentials:true
            },
        } as Partial<ServerOptions>);

        io.on('connection', (client :Socket<ClientToServerEvents,ServerToClientEvents>) => {
            const extClient = <ExtendedSocket>client;

            extClient.on('newGame', () =>{
                 console.log('novo jogo')
                let roomName = makeId(5);
                this.clientRooms[client.id] =  roomName;
                extClient.emit('gameCode',roomName);

                this.roomStates[roomName] = initGame();
                extClient.join(roomName);
                extClient.num = 1; //Extend socket Just to store a new property
                extClient.emit('init',1);
            } );

            extClient.on('joinGame',(gameCode: string)=>{
                const room = io.sockets.adapter.rooms.get(gameCode);
                //console.log(gameCode);
                //console.log(room);
                let numClients = 0;
                if(room){
                    numClients = room.size;
                }

                if(numClients === 0 ){
                    client.emit('unknownGame');
                    return;
                }else if (numClients > 1){
                    client.emit('tooManyPlayers');
                    return;
                }

                this.clientRooms[extClient.id] = gameCode;
                extClient.join(gameCode);
                extClient.num = 2;
                extClient.emit('init',2);

                startGameInterval(gameCode,this.roomStates,io);
            })
            console.log(`User : ${client.id} connected`);

            extClient.on('keyDown', (key) => {
                const roomName =  this.clientRooms[extClient.id];
                if(!roomName) return;
                //console.log(key);
                const vel = updateVelocity(key);
                
                if(vel){
                    this.roomStates[roomName]!.player[extClient.num - 1].velocity = vel;
                }
            })

            extClient.on('disconnect', () => {
                console.log(`User : ${client.id} disconnected`);
            })
        })
    }

    public Start() {
        this.server.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}.`)
        })
    }
}

new App(port).Start()
