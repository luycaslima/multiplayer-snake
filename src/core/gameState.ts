import { Server } from "socket.io";
import { FRAME_RATE, GRID_SIZE } from "./constants.js"; //NEED THIS JS BECAUSE THE TS-NODE CANT FIND MODULES.WORKAROUND
import { ClientToServerEvents, IFood, ISnake, RoomStates, ServerToClientEvents, Vector2, Winner } from "./interfaces";

export interface gameState{
    player: Array<ISnake>;
    food: IFood;
    gridSize: number; //World Space
}

export function initGame() : gameState {
    const state = createGameState();
    randomizeFoodPosition(state);
    return state;
}

function createGameState() : gameState {
    return {
        player:[ 
            {
                pos: {
                    x: 3,
                    y: 10,
                },
                velocity: {
                    x: 0,
                    y: 0,
                },
                bodyPartPos: [
                    {x:1,y: 10},
                    {x:2,y: 10},
                    {x:3,y: 10},
                ],
            },
            {
                pos: {
                    x: 18,
                    y: 14,
                },
                velocity: {
                    x: 0,
                    y: 0,
                },
                bodyPartPos: [
                    {x:20,y: 14},
                    {x:19,y: 14},
                    {x:18,y: 14},
                ],
            }
        ],
        food: {}
        ,
        gridSize: GRID_SIZE
    } as gameState;
}

export function startGameInterval(roomName : string, roomStates: RoomStates, io : Server<ClientToServerEvents,ServerToClientEvents,gameState>/*, state: gameState*/): void{
    const intervalId = setInterval(() => {
        const winner = gameLoop(roomStates[roomName]);
        if ( !winner && roomStates[roomName] !== null ) {
            emitGameState(roomName,roomStates[roomName]!,io);
            //client.emit('gameState',JSON.stringify(state))
        } else {
            emitGameOver(roomName,winner!,io);
            roomStates[roomName] = null;
            //client.emit('gameOver');
            clearInterval(intervalId);
        }
    }, 1000/ FRAME_RATE)
}

export function emitGameState(roomName:string, state: gameState,io : Server<ClientToServerEvents,ServerToClientEvents,gameState> ){
    io.sockets.in(roomName).emit('gameState', JSON.stringify(state));
}

export function emitGameOver(roomName:string,winner :number, io : Server<ClientToServerEvents,ServerToClientEvents,gameState>){
    io.sockets.in(roomName).emit('gameOver', JSON.stringify({winner} as Winner));
}

export function gameLoop(state: gameState | null) : 1 | 2 | undefined{
    if (!state) return;
    const playerOne = state.player[0];
    const playerTwo = state.player[1];

    playerOne.pos.x += playerOne.velocity.x;
    playerOne.pos.y += playerOne.velocity.y;

    playerTwo.pos.x += playerTwo.velocity.x;
    playerTwo.pos.y += playerTwo.velocity.y;

    if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
        return 2; 
    }
    if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
        return 1; 
    }

    if (state.food.pos.x === playerOne.pos.x && state.food.pos.y === playerOne.pos.y) {
        playerOne.bodyPartPos.push({ ...playerOne.pos })
        playerOne.pos.x += playerOne.velocity.x;
        playerOne.pos.y += playerOne.velocity.y;
        randomizeFoodPosition(state);
    }
    
    if (state.food.pos.x === playerTwo.pos.x && state.food.pos.y === playerTwo.pos.y) {
        playerTwo.bodyPartPos.push({ ...playerTwo.pos })
        playerTwo.pos.x += playerTwo.velocity.x;
        playerTwo.pos.y += playerTwo.velocity.y;
        randomizeFoodPosition(state);
    }

    //hitting himself
    if (playerOne.velocity.x || playerOne.velocity.y) {
        for (const cell of playerOne.bodyPartPos) {
            if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
                return 2;
            }
        }
    }

    if (playerTwo.velocity.x || playerTwo.velocity.y) {
        for (const cell of playerTwo.bodyPartPos) {
            if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
                return 1;
            }
        }
    }

    //moving the parts of the body by shifting position
    playerOne.bodyPartPos.push({ ...playerOne.pos });
    playerOne.bodyPartPos.shift();

    playerTwo.bodyPartPos.push({ ...playerTwo.pos });
    playerTwo.bodyPartPos.shift();

}   

export function randomizeFoodPosition(state: gameState) : void {
    const food = {
        pos: { 
            x:Math.floor(Math.random() * GRID_SIZE),
            y:Math.floor(Math.random() * GRID_SIZE),
        }
    } as IFood

    for (const cell of state.player[0].bodyPartPos) {
        if (cell.x === food.pos.x && cell.y === food.pos.y) {
            return randomizeFoodPosition(state);
        }
    }

    for (const cell of state.player[1].bodyPartPos) {
        if (cell.x === food.pos.x && cell.y === food.pos.y) {
            return randomizeFoodPosition(state);
        }
    }

    state.food = food;
}

export function updateVelocity(pressedKeys :string) : Vector2 | undefined {
    switch (pressedKeys){
        case 'ArrowDown':
            return {x: 0, y: 1} as Vector2;
        case 'ArrowUp':
            return {x: 0, y: -1} as Vector2;
        case 'ArrowLeft':
            return {x: -1, y: 0} as Vector2;
        case 'ArrowRight':
            return {x: 1, y: 0} as Vector2;
        default:
            return undefined;
    }
}