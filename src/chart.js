import _ from 'lodash';
import Raphael from 'raphael';
import Line from './line';
import Shape from './shape';
import Utils from './utils';
import defaults from './defaults';

export default class Chart {
    constructor(paper, data, options) {
        this.$el = paper;
        // 创建画布
        this.paper = Raphael(paper);
        // 格式化数据        
        this.data = this.setData(data);
        // 配置参数
        this.options = this.setOptions(options);
        // 存储事件
        this.$event = {
            click: [],
            dblclick: [],
            draggable: [],
            hover: []
        };
        this.shapes = [];
        this.lines = [];
        // 渲染数据
        if (this.data.length) {
            this._render();
        }
        return this;
    }
    /**
     * 获取chart宽度
     * @return {Number}
     */
    get width() {
        return this.paper.width;
    }
    /**
     * 设置chart宽度
     * @param  {Number} width
     */
    set width(width) {
        this.setPaper({ width: width, height: this.height });
    }
    /**
     * 获取chart高度
     * @return {Number}
     */
    get height() {
        return this.paper.height;
    }
    /**
     * 设置chart高度
     * @param  {Number} height
     */
    set height(height) {
        this.setPaper({ width: this.width, height: height });
        return this;
    }
    /**
     * 设置画布大小
     * @param  {Object} paper
     * @return {Object} paper
     */
    setPaper(paper) {
        let minWidth = this.$el.offsetWidth;
        let minHeight = this.$el.offsetHeight;
        let width = paper.width;
        let height = paper.height;
        if (width < minWidth) {
            width = minWidth;
        }
        if (height < minHeight) {
            height = minHeight;
        }
        this.paper.setSize(width, height);
        if (_.isArray(this.lines)) {
            // 修改线条位置
            for (let i = this.lines.length - 1; i >= 0; i--) {
                for (let j = 0; j < this.lines[i].length; j++) {
                    this.lines[i][j].refresh();
                }
            }
        }
        return this.paper;
    }
    /**
     * 设置数据
     * 并格式化数据为二维数组
     * 第一维为level(层级)
     * 第二维为每一级(level)中的对象(shape)
     * @param  {Array}  data
     * @return {Array}  data
     */
    setData(data) {
        this.data = _.isArray(data) ? data : [];
        return this.data;
    }
    /**
     * 设置配置参数
     * 详细配置参数可参考defaults.js
     * @param  {Object} options
     * @return {Object} options
     */
    setOptions(options) {
        this.options = _.merge(defaults, options);
        return this.options;
    }
    /**
     * 渲染数据生成shape对象
     * 并设置布局
     * @return {Chart} self
     */
    _render() {
        const data = this.data;
        const paperPadding = this.options.paperPadding
        const shapes = [];
        let shiftX = 0;
        let shiftY = 0;
        for (let i = 0, length = data.length; i < length; i++) {
            // 创建shape对象
            let shape = new Shape(this.paper, data[i], this.options);
            this._bindevent(shape);
            if (shape.x < paperPadding.x) {
                shiftX = paperPadding.x - shape.left.x;
            }
            if (shape.y < paperPadding.y) {
                shiftY = paperPadding.y - shape.y;
            }
            shapes.push(shape);
        }
        this.shapes = shapes;
        if (this.options.autolayout) {
            this.autolayout();
        } else {
            this.shift(shiftX, shiftY);
        }
        this.resize();
        this._drawLine();
        return this;
    }
    _bindevent(shape) {
        // 单击事件
        if (this.options.clickable) {
            shape.click((e, _shape) => {
                for (let i = 0, length = this.$event.click.length; i < length; i++) {
                    this.$event.click[i].call(_shape, e, _shape);
                }
            });
        }
        // 双击事件
        if (this.options.dblclickable) {
            shape.dblclick((e, _shape) => {
                for (let i = 0, length = this.$event.dblclick.length; i < length; i++) {
                    this.$event.dblclick[i].call(_shape, e, _shape);
                }
            });
        }
        // 拖拽事件
        if (this.options.draggable) {
            shape.draggable({
                onstart: (e, _shape) => {
                    for (let i = 0, length = this.$event.draggable.length; i < length; i++) {
                        this.$event.draggable[i].onstart && this.$event.draggable[i].onstart.call(_shape, e, _shape);
                    }
                },
                onmove: (e, _shape, dx, dy) => {
                    for (let i = this.lines.length - 1; i >= 0; i--) {
                        this.lines[i].refresh();
                    }
                    for (let i = 0, length = this.$event.draggable.length; i < length; i++) {
                        this.$event.draggable[i].onmove && this.$event.draggable[i].onmove.call(_shape, e, _shape, dx, dy);
                    }
                },
                onend: (e, _shape) => {
                    for (let i = 0, length = this.$event.draggable.length; i < length; i++) {
                        this.$event.draggable[i].onend && this.$event.draggable[i].onend.call(_shape, e, _shape);
                    }
                }
            });
        }
        // hover事件
        if (this.options.hoverable) {
            shape.hover({
                in: (e, _shape) => {
                    for (let i = 0, length = this.$event.hover.length; i < length; i++) {
                        this.$event.hover[i].in && this.$event.hover[i].in.call(_shape, e, _shape);
                    }
                },
                out: (e, _shape) => {
                    for (let i = 0, length = this.$event.hover.length; i < length; i++) {
                        this.$event.hover[i].out && this.$event.hover[i].out.call(_shape, e, _shape);
                    }
                }
            });
        }
    }
    /**
     * 画布重绘方法
     * @return {Chart} self
     */
    refresh() {
        this.paper.clear();
        // 渲染数据
        this._render();
        return this;
    }
    /**
     * 画布大小改变
     * @return {Chart} self
     */
    resize() {
        const shapes = this.shapes;
        const paperPadding = this.options.paperPadding;
        let left, right;
        for (let i = 0; i < shapes.length; i++) {
            if (i === 0) {
                left = shapes[i].left.x;
                right = shapes[i].right.x;
            }
            if (left >= shapes[i].left.x) {
                left = shapes[i].left.x;
            }
            if (right <= shapes[i].right.x) {
                right = shapes[i].right.x;
            }
        }
        let x = left - paperPadding.x;
        let y = 0;
        let width = right + paperPadding.x - x;
        let height = this.height;
        // 改变画布大小
        this.width = width;
        // 设置视窗
        this.paper.setViewBox(x, y, width, height, true);
        return this;
    }
    /**
     * 设置画布中的元素布局
     * 让所有元素相对画布中心对称定位
     * @return {Chart} self
     */
    shift(x, y) {
        const shapes = this.shapes;
        const paperPadding = this.options.paperPadding;
        let width = this.$el.offsetWidth;
        let height = this.$el.offsetHeight;
        for (let i = 0; i < shapes.length; i++) {
            shapes[i].shiftX(x);
            shapes[i].shiftY(y);
            if (width < shapes[i].right.x + paperPadding.x) {
                width = shapes[i].right.x + paperPadding.x;
            }
            if (height < shapes[i].bottom.y + paperPadding.y) {
                height = shapes[i].bottom.y + paperPadding.y;
            }
        }
        // 设置画布大小
        this.width = width;
        this.height = height;
        return this;
    }
    /**
     * 自动布局
     * @return {Chart} self
     */
    autolayout() {
        let start = null;
        // 找到开始节点
        for (let i = 0, length = this.shapes.length; i < length; i++) {
            let temp = false;
            for (let j = 0, len = this.shapes.length; j < len; j++) {
                if (this.shapes[j].to.indexOf(this.shapes[i].id) !== -1) {
                    temp = true;
                }
            }
            if (!temp) {
                start = this.shapes[i];
                break;
            }
        }
        // 绘制开始节点
        if (start) {
            let x = this.paper.width / 2 - start.width / 2;
            let y = this.options.paperPadding.y;
            start.set(x, y);
            next.call(this, start);
        }
        let minX = 0;
        let minY = 0;
        for (let i = 0, length = this.shapes; i < length; i++) {
            delete this.shapes.autolayout;
            if (!minX) {
                minX = this.shapes[i].left.x;
            }
            if (!minY) {
                minY = this.shapes[i].top.y;
            }
            if (minX > this.shapes[i].left.x) {
                minX = this.options.paperPadding.x - this.shapes[i].left.x;
            }
            if (minY > this.shapes[i].top.x) {
                minY = this.options.paperPadding.y - this.shapes[i].top.y;
            }
        }
        this.shift(minX, minY);
        return this;
        /**
         * 绘制本节点的下一个图形节点
         * @param  {Shape}  prev 
         */
        function next(prev) {
            prev.autolayout = true;
            for (let i = 0, length = prev.to.length; i < length; i++) {
                for (let j = 0, len = this.shapes.length; j < len; j++) {
                    if (prev.to[i].to == this.shapes[j].id) {
                        if (!this.shapes[j].autolayout) {
                            let x = prev.center.x - this.shapes[j].width / 2;
                            let y = prev.bottom.y + this.options.spacing.y;
                            // 是否左右对称排列,镜像排列
                            if (prev.to.length % 2 == 0 && this.options.symmetricalLayout) {
                                // 相对于中心左右镜像分布
                                // 有偶数个元素时
                                // 第一个元素会相对中心线偏移
                                if (i % 2 == 1) {
                                    x += -(i + 1) / 2 * (this.shapes[j].width / 2 + this.shapes[j].width / 2 + this.options.spacing.x);
                                } else {
                                    x += Math.ceil((i + 1) / 2) * (this.shapes[j].width / 2 + this.shapes[j].width / 2 + this.options.spacing.x);
                                }
                            } else {
                                // 相对于中间对称分布
                                // 但不是镜像的
                                // 第一个元素位于中心位置
                                if (i % 2 == 1) {
                                    x += -Math.ceil(i / 2) * (this.shapes[j].width / 2 + this.shapes[j].width / 2 + this.options.spacing.x);
                                } else {
                                    x += i / 2 * (this.shapes[j].width / 2 + this.shapes[j].width / 2 + this.options.spacing.x);
                                }
                            }
                            this.shapes[j].set(x, y);
                            next.call(this, this.shapes[j]);
                        }
                    }
                }
            }
        }
    }
    /**
     * 连接各个shape对象
     * @return {Chart} self
     */
    _drawLine() {
        let lines = [];
        // 遍历所有shape对象
        // 找出shape连接到的对象
        for (let i = 0, length = this.shapes.length; i < length; i++) {
            for (let j = 0, len = this.shapes.length; j < len; j++) {
                for (let k = 0, l = this.shapes[i].to.length; k < l; k++) {
                    if (this.shapes[i].to[k].to === this.shapes[j].id) {
                        let line = new Line(this.paper, {
                            id: this.shapes[i].to[k].id,
                            type: this.shapes[i].to[k].type,
                            from: this.shapes[i],
                            to: this.shapes[j],
                            text: this.shapes[i].to[k].text,
                            data: this.shapes[i].to[k].data
                        }, this.options);
                        lines.push(line);
                    }
                }
            }
        }
        this.lines = lines;
        return this;
    }
    /**
     * 单击事件绑定回调函数
     * @param  {Function} callback
     * @return {Chart} self
     */
    click(callback) {
        if (_.isFunction(callback)) {
            this.$event.click.push(callback);
        }
        return this;
    }
    /**
     * 双击事件绑定回调函数
     * @param  {Function} callback
     * @return {Chart} self
     */
    dblclick(callback) {
        if (_.isFunction(callback)) {
            this.$event.dblclick.push(callback);
        }
        return this;
    }
    /**
     * 拖拽事件绑定回调函数
     * @param  {Function|Object} callback
     * callback为Function时,默认为onmove事件
     * callback为Object时,可支持三个属性(onstart,onmove,onend)
     * 且这三个属性必须为函数时才有效
     * @return {Chart} self
     */
    draggable(callback) {
        if (_.isFunction(callback)) {
            callback = {
                onmove: callback
            }
        }
        if (_.isObject(callback)) {
            const _callback = {};
            // 拖拽开始
            if (_.isFunction(callback.onstart)) {
                _callback.onstart = callback.onstart;
            }
            // 拖拽过程中
            if (_.isFunction(callback.onmove)) {
                _callback.onmove = callback.onmove;
            }
            // 拖拽结束
            if (_.isFunction(callback.onend)) {
                _callback.onend = callback.onend;
            }
            this.$event.draggable.push(_callback);
        }
        return this;
    }
    /**
     * hover事件绑定回调函数
     * @param  {Function|Object} callback
     * callback为Function时,默认为in事件
     * callback为Object时,可支持两个属性(in,out)
     * 且这三个属性必须为函数时才有效
     * @return {Chart} self
     */
    hover(callback) {
        if (_.isFunction(callback)) {
            callback = {
                in: callback
            }
        }
        if (_.isObject(callback)) {
            const _callback = {};
            // in
            if (_.isFunction(callback.in)) {
                _callback.in = callback.in;
            }
            // out
            if (_.isFunction(callback.out)) {
                _callback.out = callback.out;
            }
            this.$event.hover.push(_callback);
        }
        return this;
    }
}