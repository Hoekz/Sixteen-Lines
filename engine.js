const LINE_COUNT = 16;
const THRESHOLD_DIFF = 100;

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

export class Line {
    constructor(canvas, map, index) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.shapes = map.filter((_, i) => i % LINE_COUNT === index);

        this.state = {
            diff: 0,
            first: null,
            second: null,
        };
    }

    render(x, y, t) {
        // TODO: cache closest shapes, determine if should recalc closeness
        const [first, second] = this.state.first ? [this.state.first, this.state.second] : this.shapes
            .map(shape => ({ shape, dist: sqDist(x, y, shape.x, shape.y) }))
            .sort((a, b) => a.dist - b.dist);
        
        const diff = second.dist - first.dist;
        const reverse = second.shape.order < first.shape.order;

        this.state.first = first;
        this.state.second = second;

        if (diff < THRESHOLD_DIFF) {
            const shape = first.shape.clone();

            shapes.points = extract(diff / THRESHOLD_DIFF, reverse, first.shape.points);

            return shape.render(x, y, t);
        }

        return first.shape.render(x, y, t);
    }
}

export class Map {
    constructor(config, shapes, enemies, animations) {
        this.x = config.x;
        this.y = config.y;
        this.next = config.next;
        this.shapes = shapes;
        this.enemies = enemies;
        this.animations = animations;
    }
}
