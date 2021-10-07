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

export default class Ball {
    private _position: Cords;
    private readonly _selectHandler: (ball: Ball) => void;
    private _selected: boolean = false;

    public readonly color: Color;
    public readonly ref: HTMLElement;

    constructor(position: Cords, selectHandler: (ball: Ball) => void) {
        this._position = position;
        this._selectHandler = selectHandler;
        const colors = Object.values(Color);
        this.color = colors[Math.floor(Math.random() * colors.length)] as Color;

        this.ref = document.createElement('div');
        this.ref.classList.add('ball');
        this.ref.style.backgroundColor = this.color;
        this.ref.addEventListener('click', () => this.onSelect());
    }

    private onSelect() {
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
}