
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
    
}
  
export interface ClientToServerEvents {
    keyDown: (key : string) => void;
    gameState: (state: string) => void;
    gameOver: () => void;

}
