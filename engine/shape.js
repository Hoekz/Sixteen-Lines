export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    clone() {
        return new Point(this.x, this.y);
    }

    rotate(cx, cy, theta) {
        const dx = this.x - cx;
        const dy = this.y - cy;
        return new Point(dx * Math.cos(theta) - dy * Math.sin(theta) + cx, dx * Math.sin(theta) + dy * Math.cos(theta) + cy);
    }

    scale(cx, cy, sx, sy = sx) {
        return new Point(sx * (this.x - cx) + cx, sy * (this.y - cy) + cy);
    }
}

export class BezierPoint extends Point {
    constructor(inPt, point, outPt) {
        this.in = inPt;
        this.x = point.x;
        this.y = point.y;
        this.out = outPt;
    }

    clone() {
        return new BezierPoint(this.in.clone(), super.clone(), this.out.clone());
    }

    rotate(cx, cy, theta) {
        return new BezierPoint(this.in.rotate(cx, cy, theta), super.rotate(cx, cy, theta), this.out.rotate(cx, cy, theta));
    }

    scale(cx, cy, sx, sy = sx) {
        return new BezierPoint(this.in.scale(cx, cy, sx, sy), super.scale(cx, cy, sx, sy), this.out.scale(cx, cy, sx, sy));
    }
}

export class Shape extends Point {
    constructor(points, cx, cy) {
        this.points = points;
        this.x = cx;
        this.y = cy;
    }

    clone() {
        return new Shape(this.points.map(pt => pt.clone()), this.x, this.y);
    }

    scale(pts, x, y, t) {
        return pts;
    }

    rotate(pts, x, y, t) {
        return pts;
    }

    fillColor(pts, x, y, t) {
        return '#00000000';
    }

    render(x, y, t) {
        return {
            points: this.scale(this.rotate(this.points, x, y, t), x, y, t).reduce((pts, pt) => pts.concat([pt.in, pt.point, pt.out]), []),
            fill: this.fillColor(x, y, t)
        };
    }
}
