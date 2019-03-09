import { sqDist } from './util';
import { Point, BezierPoint, Shape } from './shape';

function extract(per, rev, pts) {
    const len = pts.length;
    let newPts = rev ? pts.slice().reverse() : pts.slice();
    const lastIndex = Math.floor(len * per);
    const diff = len * per - lastIndex;
    const nextIndex = lastIndex + 1;
    const last = pts[lastIndex];
    const next = pts[nextIndex];

    const adjusted = adjustedBezier(last, next, diff);

    newPts = newPts.slice(0, lastIndex - 1).concat(adjusted);

    return rev ? newPts.reverse() : newPts;
}

function adjustedBezier(a, b, t) {
    const s_x = a.x;
    const s_y = a.y;
    const a_x = a.out.x;
    const a_y = a.out.y;
    const b_x = b.in.x;
    const b_y = b.in.y;
    const e_x = b.x;
    const e_y = b.y;

    const s_a_x = t * (a_x - s_x) + s_x;
    const s_a_y = t * (a_y - s_y) + s_y;
    const b_e_x = t * (e_x - b_x) + b_x;
    const b_e_y = t * (e_y - b_y) + b_y;
    const n_e_x = t * (s_a_x - b_e_x) + b_e_x;
    const n_e_y = t * (s_a_y - b_e_y) + b_e_y;

    const newOut = new Point(s_a_x, s_a_y);
    const newIn = new Point(b_e_x, b_e_y);
    const newPoint = new Point(n_e_x, n_e_y);

    return [new BezierPoint(a.in, a, newOut), new BezierPoint(newIn, newPoint, b.out)];
}

export default class Line {
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
            .map(shape => ({
                shape,
                dist: sqDist(x, y, shape.x, shape.y)
            }))
            .sort((a, b) => a.dist - b.dist);

        const diff = second.dist - first.dist;
        const reverse = second.shape.order < first.shape.order;

        this.state.first = first;
        this.state.second = second;

        if (diff < THRESHOLD_DIFF) {
            const shape = first.shape.clone();

            shapes.points = extract(diff / THRESHOLD_DIFF, reverse, first.shape.points);

            const res = shape.render(x, y, t);
            res.completeness = diff / THRESHOLD_DIFF;

            return res;
        }

        const res = first.shape.render(x, y, t);
        res.completeness = 1;

        return res;
    }
}
