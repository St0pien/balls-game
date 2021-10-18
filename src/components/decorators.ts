import { Color } from "./Ball";
import Grid from "./Grid";
import Ball from "./Ball";


export function randomizeColors<T extends { new(...args: any[]): Grid }>(constr: T) {
    return class extends constr {
        private lastSelected: Ball;

        handleClick() {
            this.lastSelected = this._selectedBall;
            super.handleClick();
        }

        generateBalls() {
            super.generateBalls();
            const oldBalls = this.balls.slice(0, -this._ballsPerRound*2);
            const chosedBalls: Ball[] = [];

            let counter = 3;
            oldBalls.slice().forEach(ball => {
                if (Math.random() > 0.3) return;
                if (counter == 0) return;
                counter--;
                chosedBalls.push(ball);

                const colors = Object.values(Color);
                const rndColor = colors[Math.floor(Math.random() * colors.length)] as Color;
                if (this.lastSelected !== ball) {
                    ball.color = rndColor;
                    ball.ref.style.animationName = 'highlight';
                    ball.ref.style.animationDuration = '1s';
                    setTimeout(() => ball.ref.style.animationName = '', 1000);
                }
            });

            setTimeout(() => {
                oldBalls.forEach(({ position }) => {
                    this.popBalls(position);
                });
            }, 1000);
        }
    }
}