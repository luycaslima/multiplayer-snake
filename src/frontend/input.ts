import { Game } from "../game";

export class Input {
    public static readonly state: Map<string, boolean> = new Map<string,boolean>;

    public static initiate() : void{
        document.addEventListener('keydown', Input.keyDown);
        document.addEventListener('keyup', Input.keyUp);
    }

    private static keyDown(e: KeyboardEvent): void{
        Input.state.set(e.key, true);
        Game.getSocket.emit('keyDown', e.key);
    }

    private static keyUp(e: KeyboardEvent): void{
        Input.state.set(e.key, false);
    }

}