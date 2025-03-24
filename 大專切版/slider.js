import Splide from '@splidejs/splide';
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll';

/* slider.js 滑動照片*/
var splide = new Splide('.splide', {
    type: 'loop',
});
var bar = splide.root.querySelector('.my-slider-progress-bar');

// Updates the bar width whenever the carousel moves:
splide.on('mounted move', function () {
    var end = splide.Components.Controller.getEnd() + 1;
    var rate = Math.min((splide.index + 1) / end, 1);
    bar.style.width = String(100 * rate) + '%';
});

splide.mount();

// New Splide instance with AutoScroll
const splideAutoScroll = new Splide('.splide-auto-scroll', {
    type: 'loop',
    drag: 'free',
    focus: 'center',
    perPage: 3,
    autoScroll: {
        speed: 1,
    },
});

splideAutoScroll.mount({ AutoScroll });
