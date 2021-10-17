import { Color } from "./Ball";

export default class Preview {
    public readonly ballsRef: HTMLElement;
    public readonly scoreRef: HTMLElement;
    private _nextColors: Color[] = [];
    private _score: number = 0;

    constructor() {
        this.ballsRef = document.querySelector('.balls');
        this.scoreRef = document.querySelector('.points');
    }

    randomColors(amount: number) {
        this.colors.splice(0);
        for (let i=0; i<amount; i++) {
            const colors = Object.values(Color);
            this._nextColors.push(colors[Math.floor(Math.random() * colors.length)] as Color);
        }

        this.renderPreview();
    }

    private renderPreview() {
        this.ballsRef.innerHTML = '';
        const frag = document.createDocumentFragment();
        this._nextColors.forEach(c => {
            const ball: HTMLElement = document.createElement('div');
            ball.classList.add('ball');
            ball.style.background = c;
            frag.appendChild(ball);
        });
        this.ballsRef.appendChild(frag);
    }

    public get colors() {
        return this._nextColors;
    }

    public set score(value: number) {
        this._score = value;
        this.scoreRef.innerHTML = value.toString();
    }

    public get score() {
        return this._score;
    }
}