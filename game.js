import parseMap from './loader';
import Renderer from './render';
import UserInterface from './interface';

const canvas = document.querySelector('canvas');
const renderer = new Renderer(canvas);
const ui = new UserInterface(canvas);
const map = parseMap('./data.map');

const next = window.requestAnimationFrame;

function frame() {
    const inputs = ui.inputs(true);
    renderer.render(map.apply(inputs));
    next(frame);
}

next(frame);
