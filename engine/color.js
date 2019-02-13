export default class Color {
    constructor(str) {
        if (!(/^#[a-f0-9]{8}$/.test(str))) {
            throw new Error('Color must match format of #RRGGBBAA');
        }

        this.r = parseInt(str.substr(1, 2), 16);
        this.g = parseInt(str.substr(3, 2), 16);
        this.b = parseInt(str.substr(5, 2), 16);
        this.a = parseInt(str.substr(7, 2), 16);
    }

    toString() {
        return '#' + [this.r, this.g, this.b, this.a].map(n => ('00' + n.toString(16)).substr(-2)).join('');
    }

    // TODO add mutator functions
}