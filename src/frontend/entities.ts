import { Container, Graphics, Point } from "pixi.js";
import { FOOD_COLOR, SNAKE_COLOR } from "../core/constants";
import { IFood, ISnake, Vector2 } from "../core/interfaces";
import { Game } from "../game";


export class Snake implements ISnake {

    pos: Vector2; //Head position 
    velocity: Vector2 = {x: 0, y:0 } as Vector2;
    bodyPartPos: Array<Vector2>;

    public body: Array<Graphics>
    constructor(pos: Vector2, size: number) {
        //super();
        this.pos = pos;
        
        this.body = []
        this.bodyPartPos = [];

        this.body.push(this.createBodyPart( size))       
        this.body.push(this.createBodyPart( size))                
        this.body.push(this.createBodyPart(size))  
        
        this.bodyPartPos.push({x: pos.x-2 * size,y: pos.y * size } as Vector2);
        this.bodyPartPos.push({x: pos.x-1 * size,y: pos.y * size } as Vector2);
        this.bodyPartPos.push({x: pos.x * size,y: pos.y * size } as Vector2);
        

        this.body[2].position = new Point(pos.x *size , pos.y * size);
        this.body[1].position = new Point((pos.x - 1) * size,pos.y *size );
        this.body[0].position = new Point((pos.x - 2) * size, pos.y * size);

    }

    public createBodyPart(size: number) : Graphics {
        const obj = new Graphics();
        obj.lineStyle(3, SNAKE_COLOR, 1, 0)
        obj.beginFill(0xffffff);
        obj.drawRect(0, 0, size, size);
        obj.endFill();
        return obj;
    }

    public updateBodyPositions(parts: Array<Vector2>,size : number): void{
        if (this.body.length !== parts.length) {
            const part = this.createBodyPart(size);
            this.bodyPartPos.unshift(parts[0]);
            this.body.unshift(part);
            this.body[0].position.x = parts[0].x * size;
            this.body[0].position.y = parts[0].y * size;
            Game.growSnakes(part);
        }

        for (let i = 0; i < this.body.length; i++) {
            this.body[i].position = new Point(parts[i].x * size, parts[i].y * size);
        }
       
    }


}

export class Food extends Container implements IFood {
    pos: Vector2;
    private body: Graphics;
    constructor(position: Vector2, size : number ) {
        super();
        this.pos = position;
        this.position = new Point(position.x * size, position.y * size);
        
        this.body = new Graphics();
        this.body.lineStyle(3, FOOD_COLOR,1,0.0)
        this.body.beginFill(0xffb118);
        this.body.drawRect(0, 0, size, size);
        this.body.endFill();
        
        this.addChild(this.body);
    }

}
