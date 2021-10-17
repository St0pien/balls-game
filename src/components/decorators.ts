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
            oldBalls.forEach(ball => {
                if (Math.random() > 0.3) return;

                const colors = Object.values(Color);
                const rndColor = colors[Math.floor(Math.random() * colors.length)] as Color;
                if (this.lastSelected !== ball) {
                    ball.color = rndColor;
                    ball.ref.style.animationName = 'highlight';
                    ball.ref.style.animationDuration = '1s';
                    setTimeout(() => ball.ref.style.animationName = '', 1000);
                }
            });
        }
    }
}