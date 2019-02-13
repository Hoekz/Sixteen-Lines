import { Point, BezierPoint } from "./engine";

export default class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    renderLine(line) {
        const len = line.length;
        let last = null;

        for (let i = 0; i < len; i++) {
            const point = line[i];
            if (last instanceof BezierPoint && point instanceof BezierPoint) {
                // full bezier
                this.ctx.bezierCurveTo(last.out.x, last.out.y, point.in.x, point.in.y, point.x, point.y);
            } else if (last instanceof BezierPoint && point instanceof Point) {
                // partial bezier
                this.ctx.bezierCurveTo(last.out.x, last.out.y, last.out.x, last.out.y, point.x, point.y);
            } else if (last instanceof Point && point instanceof BezierPoint) {
                // partial bezier
                this.ctx.bezierCurveTo(point.in.x, point.in.y, point.in.x, point.in.y, point.x, point.y);
            } else if (last instanceof Point && point instanceof Point) {
                // straight line
                this.ctx.lineTo(point.x, point.y);
            } else if (!last) {
                // start of shape
                this.ctx.beginPath();
                this.ctx.moveTo(point.x, point.y);
            }

            last = point;
        }

        this.ctx.closePath();
        this.ctx.stroke();
    }

    render() {

    }
}