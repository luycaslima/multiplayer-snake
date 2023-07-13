import express from 'express';
import http from 'http'
import { Server, ServerOptions } from 'socket.io'
import { createGameState, gameState, startGameInterval, updateVelocity } from '../core/gameState.js';
import { ClientToServerEvents, ServerToClientEvents } from '../core/interfaces.js';

const port: number = Number(process.env.PORT) || 3000;

class App {
    private server: http.Server;
    private port: number;

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

        io.on('connection', (client) => {
            const state = createGameState();
             startGameInterval(client ,state )
            //client.emit('init', 'teste');
            console.log(`User : ${client.id} connected`);

            client.on('keyDown', (key) => {
                //console.log(key);
                const vel = updateVelocity(key);
                
                if(vel){
                    state.player.velocity = vel;
                }
            })

            client.on('disconnect', () => {
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
