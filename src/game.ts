import { Application, BaseTexture, Graphics, SCALE_MODES, settings } from "pixi.js";
import { gameState } from "./core/gameState";
import { Food, Snake} from "./frontend/entities";
import { Input } from "./frontend/input";
import { io } from "socket.io-client";
import { Vector2 } from "./core/interfaces";
import { GRID_SIZE } from "./core/constants";

export class Game {
    constructor() { }
    
    private static app: Application;
    private static state: gameState;

    private static _width: number;
    private static _height: number;

    private static player: Snake;
    private static food: Food;
    private static size: number;

    private static socket : any; //Typescript for some weird reason cant accpet the Socket<ServerToClientEvents,ClientToServerEvents>

    public static get getSocket() {
        return Game.socket
    }

    public static init(width: number, height: number, backgroundColor: string) : void{
        Game._height = height;
        Game._width = width;
        
        Game.app = new Application({
            view: document.getElementById('pixi-canvas') as HTMLCanvasElement,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            background: backgroundColor,
            width: width,
            height: height
        })
        
        const socket = io('http://localhost:3000');
        
        Game.socket = socket;

        socket.on("connect_error", (err) => {
            console.log(`connect_error due to ${err.message}`);
        });
        
        socket.on('gameState', Game.handleGameState);
        socket.on('gameOver',Game.handleGameOver);
        //Pixel art style
        BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;
        settings.ROUND_PIXELS = true; //sharper imgs but movement can appear less smooth
        
        Input.initiate();

    
        Game.size = width / GRID_SIZE;
        const player = new Snake({ x: 1, y: 0 } as Vector2, Game.size);
        const food = new Food({x: 4, y: 11} as Vector2, Game.size);

        Game.player = player;
        Game.food = food;

        Game.player.body.forEach(part => {
            Game.app.stage.addChild(part);
        })
        Game.app.stage.addChild(food);

        Game.app.ticker.maxFPS = 60;
        Game.app.ticker.minFPS = 60;


        Game.app.ticker.add(Game.update)

    }

    private static update(_delta: number) {
        Game.updateGameState();
    }


    private static updateGameState() {
        if (!Game.state) {
            return;
        }

        Game.player.updateBodyPositions(Game.state.player.bodyPartPos, Game.size);

        Game.food.position.x = Game.state.food.pos.x * Game.size;
        Game.food.position.y = Game.state.food.pos.y * Game.size;
        
 
    }
    
    public static growSnakes(part: Graphics): void{
        Game.app.stage.addChild(part);
    }

    private static handleGameState(state: string) {
        Game.state = JSON.parse(state) as gameState;    
    }

    private static handleGameOver(){
        
    }
}

