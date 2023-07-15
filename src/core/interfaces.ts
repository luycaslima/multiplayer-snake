import { Socket } from "socket.io";
import { gameState } from "./gameState";

export interface Vector2 {
    x: number;
    y: number;
}

export interface ISnake {
    pos: Vector2;
    velocity: Vector2;
    bodyPartPos: Array<Vector2>;
}

export interface IFood {
    pos: Vector2;
}


export interface ServerToClientEvents {
    init : (value : number) => void;
    gameCode : (roomName :string) => void;
    unknownGame : () => void;
    tooManyPlayers : () => void;
    gameState: (state: string) => void;
    gameOver: (winner : string ) => void;
}

  
export interface ClientToServerEvents {
    newGame: () =>void;
    keyDown: (key : string) => void;
}

export interface ClientRoom {
    [key:string] :string;
}

export interface RoomStates {
    [key:string] : gameState | null;
}

export interface ExtendedSocket extends Socket{
    num : number;
}

export interface Winner { 
    winner : number;
}