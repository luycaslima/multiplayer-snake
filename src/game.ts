import { Application, BaseTexture, Graphics, SCALE_MODES, settings } from "pixi.js";
import { gameState } from "./core/gameState";
import { Food, Snake} from "./frontend/entities";
import { Input } from "./frontend/input";
import { io } from "socket.io-client";
import { Vector2, Winner } from "./core/interfaces";
import { BG_COLOR, GRID_SIZE } from "./core/constants";

export class Game {
    constructor() { }
    
    private static app: Application;
    private static state: gameState;

    private static _width: number;
    private static _height: number;

    private static clientPlayer: Snake;
    private static otherPlayer : Snake;

    private static food: Food;
    private static size: number;

    private static playerNumber? : number;
    private static isActive : boolean = false;

    private static socket : any; //Typescript for some weird reason cant accpet the Socket<ServerToClientEvents,ClientToServerEvents>

    private static gameScreen : HTMLDivElement;
    private static initialScreen : HTMLDivElement;
    private static newGameBtn : HTMLButtonElement;
    private static joinGameBtn : HTMLButtonElement 
    private static gameCodeInput : HTMLInputElement ;
    private static gameCodeDisplay : HTMLSpanElement;


    public static get getSocket() {
        return Game.socket
    }

    public static initialize(){
        Game.initialScreen  = document.getElementById('initial-screen') as HTMLDivElement;
        Game.gameScreen = document.querySelector('.game-screen') as HTMLDivElement;
        Game.newGameBtn = document.getElementById('new-button-game') as HTMLButtonElement;
        Game.joinGameBtn = document.getElementById('join-game-button') as HTMLButtonElement;
        Game.gameCodeInput = document.getElementById('game-code-input') as HTMLInputElement;
        Game.gameCodeDisplay = document.getElementById('game-code-display') as HTMLSpanElement


        Game.newGameBtn?.addEventListener('click',()=>{
            Game.initializeSocket();
            Game.socket.emit('newGame');
            Game.startCanvas(600, 600, BG_COLOR);
            Game.initialScreen.style.display = 'none';
            Game.gameScreen.style.display = 'flex';    
        });

        Game.joinGameBtn?.addEventListener('click',()=>{
            Game.initializeSocket();  
            const code = Game.gameCodeInput.value;
            Game.socket.emit('joinGame', code);
            Game.startCanvas(600, 600, BG_COLOR);
            Game.initialScreen.style.display = 'none';
            Game.gameScreen.style.display = 'flex';
        });

    }
    private static initializeSocket() : void{
        const socket = io('http://localhost:3000');
        Game.socket = socket;
        socket.on("connect_error", (err) => {
            console.log(`connect_error due to ${err.message}`);
        });
    }


    public static startCanvas(width: number, height: number, backgroundColor: string) : void{

        Game._height = height;
        Game._width = width;

        Game.socket.on('init',Game.handleInit);
        Game.socket.on('gameState', Game.handleGameState);
        Game.socket.on('gameOver',Game.handleGameOver);
        Game.socket.on('gameCode',Game.handleGameCode);
        Game.socket.on('unknownGame', Game.handleUnknownGame);
        Game.socket.on('tooManyPlayers', Game.handleTooManyPlayers);


        Game.app = new Application({
            view: document.getElementById('pixi-canvas') as HTMLCanvasElement,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            background: backgroundColor,
            width: width,
            height: height
        })
        
        Input.initiate();
    
        Game.size = width / GRID_SIZE;
        const playerOne = new Snake({ x: 0, y: 0 } as Vector2);
        const playerTwo = new Snake({ x: 0, y: 0 } as Vector2);
        
        const food = new Food({x: 0, y: 0} as Vector2, Game.size);

        Game.clientPlayer = playerOne;
        Game.otherPlayer = playerTwo;

        Game.food = food;

        //Pixel art style
        BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;
        settings.ROUND_PIXELS = true; //sharper imgs but movement can appear less smooth

        Game.app.ticker.maxFPS = 60;
        Game.app.stage.addChild(food);

        Game.app.ticker.add(Game.update)
        Game.isActive = true;
    }

    private static update(_delta: number) {
        Game.updateGameState();
    }


    private static updateGameState() {
        if (!Game.state) {
            return;
        }

        Game.clientPlayer.updateBodyPositions(Game.state.player[0].bodyPartPos, Game.size);
        Game.otherPlayer.updateBodyPositions(Game.state.player[1].bodyPartPos, Game.size); //Adicionar a cor que diferencia


        Game.food.position.x = Game.state.food.pos.x * Game.size;
        Game.food.position.y = Game.state.food.pos.y * Game.size;
        
 
    }
    
    public static growSnakes(part: Graphics): void{
        Game.app.stage.addChild(part);
    }

    private static handleGameState(state: string) {
        if(!Game.isActive) return;
        Game.state = JSON.parse(state) as gameState;    
    }

    private static handleGameOver(winnerData : string){
        if(!Game.isActive) return;
        const data = JSON.parse(winnerData) as Winner;
        if(data.winner === Game.playerNumber){
            alert('You WINN');
        }else{
            alert('You LOSE');
        }
        Game.isActive = false;
    }

    private static handleInit(playerNum : number) {
        console.log(playerNum);
        Game.playerNumber = playerNum;
    }

    private static handleGameCode(gameCode : string){
        Game.gameCodeDisplay.innerText = gameCode;
    }

    private static handleUnknownGame(){
        Game.reset();
        alert('Unknwnon Game'); //Need Better way to handle this
    }
    private static handleTooManyPlayers(){
        Game.reset();
        alert('This game is already in progress');
    }

    private static reset(){
        Game.playerNumber = undefined;
        Game.gameCodeInput.value = '';
        Game.gameCodeDisplay.innerText = '';
        Game.initialScreen.style.display = 'flex';
        Game.gameScreen.style.display = 'none';
    }
    
}

