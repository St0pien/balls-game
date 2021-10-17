import Cell from "./Cell";
import Ball, { Color } from "./Ball";
import Stats from "./Stats";
import { randomizeColors } from "./decorators";

export type Cords = [number, number];

class MazeCell {
    gValue: number = 0;
    hValue: number;
    parent: Cords;

    get value() {
        return this.gValue + this.hValue;
    }
}

@randomizeColors
export default class Grid {
    private readonly _size: Cords;
    private readonly _combo: number;
    private readonly _ref: HTMLElement;
    private readonly _cells: Cell[][];
    private _balls: Ball[] = [];
    private readonly _stats: Stats;
    private _targetCell: Cell | null = null;
    private _currentPath: Cords[];
    
    protected _selectedBall: Ball | null = null;
    protected readonly _ballsPerRound: number;

    constructor(size: Cords, ballsPerRound: number, combo=3) {
        this._size = size;
        this._ballsPerRound = ballsPerRound;
        this._combo = combo;
        this._ref = document.createElement('div');
        this._ref.classList.add('grid');
        document.body.appendChild(this._ref);

        const [rows, cols] = size;
        this._cells = [];
        const frag = document.createDocumentFragment();
        for (let i = 0; i < rows; i++) {
            this._cells[i] = [];
            for (let j = 0; j < cols; j++) {
                this._cells[i][j] = new Cell([i, j], (cell: Cell) => this.handleHover(cell));
                frag.appendChild(this._cells[i][j].ref);
            }
        }

        this._ref.appendChild(frag);

        this._ref.addEventListener('click', () => this.handleClick())

        this._stats = new Stats();

        this.generateBalls();
    }

    protected get balls() {
        return this._balls;
    }


    protected handleClick() {
        if (!this._selectedBall || !this._targetCell) return;
        const [x,y] = this._selectedBall.position;
        this._cells[x][y].empty();

        this._targetCell.placeBall(this._selectedBall);
        this.popBalls(this._targetCell.position);
        this._targetCell = null;
        this._selectedBall.deSelect();
        this._selectedBall = null;
        this.darkenMarks();
        this.generateBalls();
    }

    private handleSelect(ball: Ball) {
        if (this.getNeighbors(ball.position).length == 0) {
            ball.deSelect();
            return;
        }
        if (this._selectedBall) this._selectedBall.deSelect();
        this._selectedBall = ball.selected ? ball : null;
    }

    private handleHover(cell: Cell) {
        if (this._selectedBall) {
            const pathExists = this.findPath(cell);

            if (!cell.contains && !pathExists) {
                cell.ref.style.cursor = 'default';
                return;
            }
            if (this._selectedBall == cell.contains && this.getNeighbors(cell.position).length > 0) {
                cell.ref.style.cursor = 'default';
            }
            cell.ref.style.cursor = 'pointer';
        } else {
            if (cell.contains && this.getNeighbors(cell.position).length > 0) {
                cell.ref.style.cursor = 'pointer';
            } else {
                cell.ref.style.cursor = 'default';
            }
        }
    }

    protected generateBalls() {
        if (this._balls.length + this._ballsPerRound >= this._size[0] * this._size[1]) {
            this.gameOver();
            return;
        }

        if (this._stats.colors.length == 0) {
            this._stats.randomColors(this._ballsPerRound);
        }
        const pickedCords: Cords[] = [];
        this._stats.colors.map(c => {
            const [rows, cols] = this._size;
            let x, y;
            do {
                x = Math.floor(Math.random() * rows);
                y = Math.floor(Math.random() * cols);
            } while (this._cells[x][y].contains !== null);
            pickedCords.push([x, y]);
            const ball = new Ball([x, y], c, (ball: Ball) => this.handleSelect(ball));
            this._balls.push(ball);
            this._cells[x][y].placeBall(ball);
        });
        this._stats.randomColors(this._ballsPerRound);
        pickedCords.forEach(cord => this.popBalls(cord));
    }

    private findPath(cell: Cell): boolean {
        this._currentPath = [];
        const start: Cords = this._selectedBall.position;
        const end: Cords = cell.position

        if (this._cells[end[0]][end[1]].contains) {
            this._targetCell = null;
            this.clearMarks();
            return false;
        }

        const maze: MazeCell[][] = this._cells.map(row => row.map(() => new MazeCell()));
        let current: Cords = start;
        let available: Cords[] = [];
        while (current[0] != end[0] || current[1] != end[1]) {
            // Find available neighbors
            const neighbors = this.getNeighbors(current, maze);

            // Calculate values and add to available paths
            neighbors.forEach(([r, c]) => {
                maze[r][c].gValue = maze[current[0]][current[1]].gValue + 1;
                maze[r][c].hValue = Math.abs(end[0] - r) + Math.abs(end[1] - c);
                maze[r][c].parent = current;
                available.push([r, c]);
            });

            // Find best option
            let winnerCords: Cords = available[0];
            let winnerIndex: number;
            if (available.length <= 0) {
                this._targetCell = null;
                this.clearMarks();
                return false;
            }
            available.forEach(([r, c], index) => {
                if (maze[r][c].value < maze[winnerCords[0]][winnerCords[1]].value) {
                    winnerCords = [r, c];
                    winnerIndex = index;
                }
            });
            available.splice(winnerIndex, 1);
            current = winnerCords;
        }
        const [x, y] = current;
        this._targetCell = this._cells[x][y];
        this.reconstructPath(current, maze);

        return true;
    }

    private getNeighbors(cords: Cords, maze: MazeCell[][] = null): Cords[] {
        const [rows, cols] = this._size;
        let neighbors: Cords[] = [];
        for (let i = -1; i <= 1; i += 2) {
            let x = cords[0] + i;
            let y = cords[1];
            if (x >= 0 && x < rows && y >= 0 && y < cols) {
                neighbors.push([x, y]);
            }
            x = cords[0];
            y = cords[1] + i;
            if (x >= 0 && x < rows && y >= 0 && y < cols) {
                neighbors.push([x, y]);
            }
        }

        neighbors = neighbors.filter(([x, y]) => {
            if (this._cells[x][y].contains) return false;
            if (maze) {
                if (maze[x][y].parent) return;
            }
            return true;
        });

        return neighbors;
    }

    private reconstructPath(end: Cords, maze: MazeCell[][]) {
        this.clearMarks();

        let current: Cords = end;
        while (maze[current[0]][current[1]].parent) {
            const [x, y] = current;
            this._cells[x][y].mark();
            this._currentPath.push(current);
            current = maze[x][y].parent;
        }
        this._currentPath.push(current);
        this._cells[current[0]][current[1]].mark();
    }

    private darkenMarks() {
        this._currentPath.forEach(([x, y]) => {
            this._cells[x][y].darken();
        });
    }

    private clearMarks() {
        this._cells.forEach(row => row.forEach(cell => {
            cell.unmark();
        }));
    }

    private popBalls(cords: Cords) {
        const checkLine = (line: Cords[]): Ball[] => {
            let currentIndex = 0;
            let currentColor: Color;
            const combo: Cords[] = [];
            line.forEach(([x, y]) => {
                const cell: Cell = this._cells[x][y];

                if (!cell.contains || cell.contains.color !== currentColor) {
                    if (combo.length - currentIndex >= this._combo) {
                        currentIndex = combo.length;
                    }
                    combo.splice(currentIndex);
                    currentColor = cell.contains?.color;
                }

                combo.push([x, y]);
            });

            if (combo.length - currentIndex < this._combo) combo.splice(currentIndex);

            return combo.map(([x, y]) => this._cells[x][y].contains);
        }

        const row: Cords[] = [];
        const col: Cords[] = [];
        const diag: Cords[] = [];

        for (let i=0; i<this._size[1]; i++) {
            row.push([cords[0], i]);
        }

        for (let i=0; i<this._size[0]; i++) {
            col.push([i, cords[1]]);
        }

        const diff = Math.abs(cords[0] - cords[1]);
        for (let i=0; i + diff < this._size[0] && i+diff < this._size[1]; i++) {
            let c: Cords;
            if (cords[0] > cords[1]) {
                c = [i+diff, i];
            } else {
                c = [i, i+diff];
            }
            diag.push(c);
        }

        const toPop = [...new Set([...checkLine(row), ...checkLine(col), ...checkLine(diag)])];
        this._balls = this._balls.filter(ball => toPop.indexOf(ball) == -1);
        toPop.forEach(b => {
            const [x, y] = b.position;
            this._cells[x][y].popBall();
        });
        this._stats.score += toPop.length;
    }

    private gameOver() {
        this._ref.classList.remove('grid');
        this._ref.classList.add('result');
        this._ref.innerHTML = `
            Your score: ${this._stats.score}
        `;
    }
}
