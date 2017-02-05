import Chart from 'src/chart';
import data from './data';
import options from './options';

const $chart = document.getElementById('chart');

const chart = new Chart($chart, data, options);
chart.click((e, shape) => {});
chart.dblclick((e, shape) => {});
chart.draggable({
    onstart: (e, shape) => {},
    onmove: (e, shape, dx, dy) => {},
    onend: (e, shape) => {}
});

// 延迟时间
let delay = 300;
// 定时器
let timer = null;
window.addEventListener('resize', function(e) {
    timer && clearTimeout(timer);
    chart.width = $chart.clientWidth;
    chart.height = $chart.clientHeight;
    // 防止一直执行，造成运算量增加
    timer = setTimeout(() => {
        chart.resize();
    }, delay);
});