import { Cords } from "./Grid";

export enum Color {
    Red = '#ff0000',
    Green = '#00ff00',
    Blue = '#0000ff',
    Orange = '#ffa500',
    Black = '#000000',
    Purple = '#800080',
    Brown = '#964b00'
}

export class StaticBall  {
    public readonly color: Color;
    public readonly ref: HTMLElement;
    
    constructor(color: Color) {
        this.color = color;
        this.ref = document.createElement('div');
        this.ref.classList.add('ball');
        this.ref.style.background = this.color;
    }
}

export default class Ball {
    private readonly _animationDuration: number = 0.5;
    private _position: Cords;
    private readonly _selectHandler: (ball: Ball) => void;
    private _selected: boolean = false;

    private _color: Color;
    public readonly ref: HTMLElement;

    constructor(position: Cords, color: Color, selectHandler: (ball: Ball) => void) {
        this._position = position;
        this._selectHandler = selectHandler;
        this._color = color;

        this.ref = document.createElement('div');
        this.ref.classList.add('ball');
        this.ref.style.backgroundColor = this._color;
    }

    public get color() {
        return this._color;
    }

    public set color(value: Color) {
        this._color = value;
        this.ref.style.backgroundColor = this._color;
    }

    public onSelect() {
        if (this.selected) {
            this.deSelect();
        } 
        else {
            this.select();
        }
        this._selectHandler(this);
    }

    public get position() {
        return this._position
    }

    public get selected() {
        return this._selected;
    }

    public move(pos: Cords) {
        this._position = pos;
    }

    public select() {
        this._selected = true;
        this.ref.style.transform = 'scale(1.5)';
    }
    
    public deSelect() {
        this._selected = false;
        this.ref.style.transform = '';
    }

    public pop() {
        this.ref.style.animationName = 'pop';
        this.ref.style.animationDuration = `${this._animationDuration}s`;
        setTimeout(() => {
            this.ref.remove();
        }, this._animationDuration*1000)
    }
}