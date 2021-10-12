import Ball from "./Ball";
import { Cords } from "./Grid";

export default class Cell {
    private _position: Cords;
    private _contains: Ball | null = null;
    private _hoverHandler: (cell: Cell) => void;

    public readonly ref: HTMLElement;

    constructor(position: Cords, hoverHandler: (cell: Cell) => void) {
        this._position = position;
        this.ref = document.createElement('div');
        this.ref.classList.add('cell');
        this._hoverHandler = hoverHandler;

        this.ref.addEventListener('mouseenter', () => {
            this.onHover();
        });
        this.ref.addEventListener('click', () => this._contains?.onSelect());
    }

    private onHover() {
        this._hoverHandler(this);
    }

    public get position() {
        return this._position;
    }
    
    public get contains(): Ball | null {
        return this._contains;
    }

    empty() {
        this._contains = null;
    }

    public placeBall(ball: Ball) {
        this.ref.appendChild(ball.ref);
        ball.move(this.position);
        this._contains = ball;
    }

    public mark() {
        this.ref.style.background = '#444';
    }

    public unmark() {
        this.ref.style.background = '';
    }

    public darken() {
        this.ref.style.background = '#ddd';
    }
}