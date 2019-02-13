import { createTree, evaluate } from './expr';

export const UNKNOWN = 'UNKNOWN';
export const EVAL = 'EVALUATING';
export const KNOWN = 'KNOWN';

export class AnimationProperty {
    constructor(prop, modulus, formula) {
        this.state = UNKNOWN;
        this.ctx = null;
        this.name = prop;
        this.modulus = modulus;
        this.formula = formula;
        this.tree = createTree(formula);
    }

    set value(val) {
        this.val = val;
        this.state = KNOWN;
        return this.val;
    }

    get value() {
        if (this.state === KNOWN) {
            return this.val;
        }

        if (this.state === EVAL) {
            throw new Error(`Circular Dependency on '${this.prop}'!`);
        }

        this.state = EVAL;

        return this.value = evaluate(this.tree, Object.assign({}, this.ctx), { t: this.ctx.t % this.modulus });
    }

    set context(target) {
        if (target !== this.ctx) {
            this.state = UNKNOWN;
            this.ctx = target;
        }
    }

    get(ctx) {
        this.context = ctx;
        return this.value;
    }
}

export default class Animation {
    static Property = AnimationProperty;

    constructor(name, properties) {
        this.name = name;
        this.properties = properties.map(prop => new AnimationProperty(...prop));
    }

    frame(t) {
        const ctx = { t };
        this.properties.forEach(prop => prop.context = ctx);
        return this.properties.reduce((res, prop) => Object.assign(res, { [prop.name]: prop.get(res) }), ctx);
    }
}
