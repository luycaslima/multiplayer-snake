
import { Socket } from "socket.io";
import { FRAME_RATE, GRID_SIZE } from "./constants.js"; //NEED THIS JS BECAUSE THE TS-NODE CANT FIND MODULES.WORKAROUND
import { ClientToServerEvents, IFood, ISnake, ServerToClientEvents, Vector2 } from "./interfaces";

export interface gameState{
    player: ISnake;
    food: IFood;
    gridSize: number; //World Space
}

export function createGameState() : gameState {
    return {
        player: {
            pos: {
                x: 1,
                y: 5,
            },
            velocity: {
                x: 1,
                y: 0,
            },
            bodyPartPos: [
                {x:1,y: 10},
                {x:2,y: 10},
                {x:3,y: 10},
            ],
        },
        food: 
            {
                pos: { x: 7, y: 7 }
            }
        ,
        gridSize: GRID_SIZE
    } as gameState;
}

export function startGameInterval(client : Socket<ServerToClientEvents,ClientToServerEvents>, state: gameState): void{
    const intervalId = setInterval(() => {
        const winner = gameLoop(state);

        if (!winner) {
            client.emit('gameState',JSON.stringify(state))
        } else {
            client.emit('gameOver');
            clearInterval(intervalId);
        }
    },1000/ FRAME_RATE)
}

export function gameLoop(state: gameState) {
    const playerOne = state.player;

    playerOne.pos.x += playerOne.velocity.x;
    playerOne.pos.y += playerOne.velocity.y;

    if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
        return 2; //Player 1 perdeu (mudar para Typescript)
    }

    if (state.food.pos.x === playerOne.pos.x && state.food.pos.y === playerOne.pos.y) {
        playerOne.bodyPartPos.push({ ...playerOne.pos })
        playerOne.pos.x += playerOne.velocity.x;
        playerOne.pos.y += playerOne.velocity.y;
        randomFood(state);
    }

    //hitting himself
    if (playerOne.velocity.x || playerOne.velocity.y) {
        for (const cell of playerOne.bodyPartPos) {
            if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
                return 2;
            }
        }
    }
    //moving the parts of the body by shifting position
    playerOne.bodyPartPos.push({ ...playerOne.pos });
    playerOne.bodyPartPos.shift();

   
}   

function randomFood(state: gameState) {
    const food = {
        pos: { 
            x:Math.floor(Math.random() * GRID_SIZE),
            y:Math.floor(Math.random() * GRID_SIZE),
        }
    } as IFood

    for (const cell of state.player.bodyPartPos) {
        if (cell.x === state.player.pos.x && cell.y === state.player.pos.y) {
            return randomFood(state);
        }
    }

    state.food = food
}

export function updateVelocity(pressedKeys :string) : Vector2 | undefined{
    switch (pressedKeys){
        case 'ArrowDown':
            return {x: 0,y :1} as Vector2;
        case 'ArrowUp':
            return {x: 0,y :-1} as Vector2
        case 'ArrowLeft':
            return {x: -1,y :0} as Vector2
        case 'ArrowRight':
            return {x: 1,y :0} as Vector2
        default:
            return undefined;
    }
}