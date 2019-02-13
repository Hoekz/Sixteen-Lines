
const BASE_CONTEXT = {
    sin(x)       { return Math.sin(x) },
    cos(x)       { return Math.cos(x) },
    tan(x)       { return Math.tan(x) },
    abs(x)       { return Math.abs(x) },
    pow(x)       { return Math.pow(x) },
    sqrt(x)      { return Math.sqrt(x) },
    floor(x)     { return Math.floor(x) },
    ceil(x)      { return Math.ceil(x) },
    round(x)     { return Math.round(x) },
    max(args)    { return Math.max(...args) },
    min(args)    { return Math.min(...args) },
    or(args)     { return args.find(v => v) },
    and(args)    { return args[0] && args[1] },
    if(args)     { return args[0] ? args[1] : args[2] },
    eq(args)     { return args[0] == args[1] },
    lt(args)     { return args[0] < args[1] },
    gt(args)     { return args[0] > args[1] },
    lte(args)    { return args[0] <= args[1] },
    gte(args)    { return args[0] >= args[1] },
    btwn_b(args) { return args[0] >= args[1] && args[0] <= args[2] },
    btwn_l(args) { return args[0] >= args[1] && args[0] < args[2] },
    btwn_r(args) { return args[0] > args[1] && args[0] <= args[2] },
    btwn_n(args) { return args[0] > args[1] && args[0] < args[2] },
    not(arg)     { return !arg },
    array(args)  { return args },
    at(args)     { return args[0][args[1]] },
    has(args)    { return args[0].includes(args[1]) },
    PI: Math.PI,
};

class EvalTreeNode {
    constructor(symbol, left, right) {
        this.symbol = symbol;
        this.left = isNaN(parseFloat(left)) ? left : parseFloat(left);
        this.right = isNaN(parseFloat(right)) ? right : parseFloat(right);
    }
}

function tokenize(str) {
    const symbols = '()^*/%+-,';
    const len = str.length;
    const tokens = [];
    let current = '';

    for (let i = 0; i < len; i++) {
        if (symbols.includes(str[i])) {
            if (str[i] === '(') {
                tokens.push(current + '(');
            } else {
                tokens.push(current || '0', str[i]);
            }

            current = '';
        } else {
            current += str[i];
        }
    }

    tokens.push(current);

    return tokens.filter(t => t);
}

function stackify(tokens) {
    const stack = [];
    const len = tokens.length;

    const scopes = [stack];

    for (let i = 0; i < len; i++) {
        if (tokens[i] === '(') {
            scopes.unshift([]);
            continue;
        }

        if (tokens[i].endsWith('(')) {
            scopes[0].push(tokens[i].slice(0, -1), '@');
            scopes.unshift([]);
            continue;
        }

        if (tokens[i] === ')') {
            const child = scopes.shift();
            scopes[0].push(child);
            continue;
        }

        scopes[0].push(tokens[i]);
    }

    return stack;
}

function optimizeStack(stack) {
    if (typeof stack === 'string') {
        return stack;
    }

    if (stack.length === 1) {
        return optimizeStack(stack[0]);
    }

    if (stack.length === 0) {
        return null;
    }

    const symbols = [',', '+-', '*/%', '^@']
    const len = stack.length;

    for (let i = 0; i < symbols.length; i++) {
        for (let j = 1; j < len - 1; j++) {
            if (symbols[i].includes(stack[j])) {
                return new EvalTreeNode(
                    stack[j],
                    optimizeStack(stack.slice(0, j)),
                    optimizeStack(stack.slice(j + 1)),
                );
            }
        }
    }
}

export function createTree(str) {
    const tokens = tokenize(str.replace(/\s/g, ''));
    const stack = stackify(tokens);
    return optimizeStack(stack);
}

export function createContext(ctx) {
    return Object.assign({}, BASE_CONTEXT, ctx);
}

export function evaluate(tree, ctx) {
    if (typeof tree === 'number' || (tree instanceof Array)) {
        return tree;
    }

    if (typeof tree === 'string') {
        if (!(tree in ctx)) {
            throw new Error(`Symbol '${tree}' is not present in current context.`);
        }

        if (typeof ctx[tree] === 'number' || ctx[tree] instanceof Array) {
            return ctx[tree];
        }

        return ctx[tree].get(ctx);
    }

    switch (tree.symbol) {
        case '+':
            return evaluate(tree.left, ctx) + evaluate(tree.right, ctx);
        case '-':
            return evaluate(tree.left, ctx) - evaluate(tree.right, ctx);
        case '*':
            return evaluate(tree.left, ctx) * evaluate(tree.right, ctx);
        case '/':
            return evaluate(tree.left, ctx) / evaluate(tree.right, ctx);
        case '%':
            return evaluate(tree.left, ctx) % evaluate(tree.right, ctx);
        case '^':
            return Math.pow(evaluate(tree.left, ctx), evaluate(tree.right, ctx));
        case ',':
            return [evaluate(tree.left, ctx)].concat(evaluate(tree.right, ctx));
        case '@':
            return ctx[tree.left](evaluate(tree.right, ctx));
    }

    throw new Error(`Unrecognized operator '${tree.symbol}'.`);
}
