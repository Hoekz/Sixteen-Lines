import { Animation, BezierPoint, Point, Shape, Map } from './engine';

export default async function parseMap(str) {
    const [configStr, shapeStr, animationStr, enemyStr] = str.split('################\n');

    const [config, shapes, animations, enemies] = await Promise.all([
        parseConfig(configStr),
        parseShapes(shapeStr),
        parseAnimations(animationStr),
        parseEnemies(enemyStr),
    ]);

    return new Map(config, shapes, animations, enemies);
}

export async function parseAnimations(str) {
    return str.split('\n').reduce((animations, row) => {
        const [name, ...args] = row.split(',');
        animations[args[0]] = new Animation(name, args.map(arg => new Animation.Property(...arg.split(':'))));
        return animations;
    }, {});
}

export async function parseShapes(str) {
    return str.split('\n').reduce((data, row) => {
        const n = row.split(',').map(n => isNaN(parseFloat(n)) ? n : parseFloat(n));

        if (n.length === 2) {
            data.shape = data.shape || [];
            data.shape.push(new Point(n[0], n[1]))
        } else if (n.length === 6) {
            data.shape = data.shape || [];
            data.shape.push(new BezierPoint(new Point(n[0], n[1]), new Point(n[2], n[3]), new Point(n[4], n[5])));
        } else if (data.shape && n.length === 5) {
            data.shapes.push(new Shape(data.shape, n[0], n[1], n[2] === 'true', n[3], n[4]));
            data.shape = null;
        } else {
            throw new Error('Unrecognized number of arguments for shape: ', n.join(','));
        }

        return data;
    }, { shapes: [], shape: null }).shapes;
}

export async function parseEnemies(str) {
    return [];
}
