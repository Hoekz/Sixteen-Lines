export class Map {
    constructor(config, shapes, enemies, animations) {
        this.config = config;
        this.x = config.x;
        this.y = config.y;
        this.next = config.next;
        this.shapes = shapes;
        this.enemies = enemies;
        this.animations = animations;
    }

    fromSave(state) {
        
    }
}
