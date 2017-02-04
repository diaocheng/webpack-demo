import _ from 'lodash';
import types from './shapes';

export default class Shape {
    constructor(paper, data, options) {
        // 画布
        this.paper = paper;
        // 形状数据
        this.data = data;
        // 连接到的元素ID
        this.to = data.to;
        // 定义ID以方便后面调用
        // 在连接线条时作为判断依据
        this.id = data.id;
        // 配置参数
        this.options = options;
        // 图形类型
        this.types = types;
        // 创建set集合
        this.shape = this.paper.set();
        this.shape.shape = null;
        this.shape.text = null;
        // 渲染shape对象
        this.render();
        return this;
    }
    /**
     * 获取shape宽度
     * @return {Number}
     */
    get width() {
        return this.shape.getBBox().width;
    }
    /**
     * 获取shape高度
     * @return {Number}
     */
    get height() {
        return this.shape.getBBox().height;
    }
    /**
     * 获取shape左上角x坐标值
     * @return {Number}
     */
    get x() {
        return this.shape.getBBox().x;
    }
    /**
     * 获取shape左上角y坐标值
     * @return {Number}
     */
    get y() {
        return this.shape.getBBox().y;
    }
    /**
     * 获取shape的中心坐标值
     * @return {Object} {x: Number, y: Number}
     */
    get center() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }
    /**
     * 获取shape的顶部中间坐标值
     * @return {Object} {x: Number, y: Number}
     */
    get top() {
        return {
            x: this.x + this.width / 2,
            y: this.y
        };
    }
    /**
     * 获取shape的右边中部坐标值
     * @return {Object} {x: Number, y: Number}
     */
    get right() {
        return {
            x: this.x + this.width,
            y: this.y + this.height / 2
        };
    }
    /**
     * 获取shape的底部中间坐标值
     * @return {Object} {x: Number, y: Number}
     */
    get bottom() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height
        };
    }
    /**
     * 获取shape的左边中部坐标值
     * @return {Object} {x: Number, y: Number}
     */
    get left() {
        return {
            x: this.x,
            y: this.y + this.height / 2
        };
    }
    /**
     * 设置shape的x、y坐标
     * @param {Number} x
     * @param {Number} y
     * @return {Object} self
     */
    set(x, y) {
        if (_.isNumber(x) && _.isNumber(y)) {
            this.shape.transform(`t${x},${y}`);
        }
        return this;
    }
    /**
     * 设置shape的x轴位置
     * @param {Number} x
     * @return {Object} self
     */
    setX(x) {
        if (_.isNumber(x)) {
            this.shape.transform(`t${x},${this.y}`);
        }
        return this;
    }
    /**
     * 设置shape的y轴位置
     * @param {Number} y
     * @return {Object} self
     */
    setY(y) {
        if (_.isNumber(y)) {
            this.shape.transform(`t${this.x},${y}`);
        }
        return this;
    }
    /**
     * 沿x轴移动指定距离(x)
     * @param {Number} x
     * @return {Object} self
     */
    shiftX(x) {
        if (_.isNumber(x)) {
            this.shape.transform(`t${this.x + x},${this.y}`);
        }
        return this;
    }
    /**
     * 沿y轴移动指定距离(y)
     * @param {Number} y
     * @return {Object} self
     */
    shiftY(y) {
        if (_.isNumber(y)) {
            this.shape.transform(`t${this.x},${this.y + y}`);
        }
        return this;
    }
    /**
     * 按类型渲染形状(shape)
     * @return {Object} self
     */
    render() {
        let paper = this.paper;
        let data = this.data;
        let options = this.options;
        let type = data.type;
        if (!this.types[type]) {
            throw new Error(`没有[${type}]对应的解析方法`);
        }
        this.types[type].call(this, paper, data, options);
        this.set(Number(data.x), Number(data.y));
        return this;
    }
    /**
     * 对Raphael对象绑定单击事件
     * @param  {Function} callback    双击回调函数
     * @return {Object}   self     
     */
    click(callback) {
        this.shape.click((e, x, y) => {
            _.isFunction(callback) && callback(e, this);
        });
        return this;
    }
    /**
     * 对Raphael对象绑定双击事件
     * @param  {Function} callback    双击回调函数
     * @return {Object}   self
     */
    dblclick(callback) {
        this.shape.dblclick((e, x, y) => {
            _.isFunction(callback) && callback(e, this);
        });
        return this;
    }
    /**
     * 对Raphael对象绑定拖拽事件
     * @param  {Object} callback    拖拽回调函数对象
     * @return {Object} self    
     */
    draggable(callback) {
        this.shape.drag((dx, dy, x, y, e) => {
            let lx = dx + this.shape.ox;
            let ly = dy + this.shape.oy;
            this.set(lx, ly);
            callback && _.isFunction(callback.onmove) && callback.onmove(e, this, dx, dy);
        }, (x, y, e) => {
            this.shape.ox = this.x;
            this.shape.oy = this.y;
            callback && _.isFunction(callback.onstart) && callback.onstart(e, this);
        }, (e) => {
            delete this.shape.ox;
            delete this.shape.oy;
            callback && _.isFunction(callback.onend) && callback.onend(e, this);
        });
        return this;
    }
    /**
     * 对Raphael对象绑定hover事件
     * @param  {Object} callback    hover回调函数对象
     * @return {Object} self    
     */
    hover(callback) {
        this.shape.hover(function (e) {
            this.shape.shape.animate({
                fill: '#00ffff',
                'fill-opacity': 0.5,
                'z-index': 1000
            }, 500);
            callback && _.isFunction(callback.in) && callback.in(e, this);
        }, function (e) {
            this.shape.shape.animate({
                fill: 'none',
                'fill-opacity': 0,
                'z-index': 1000
            }, 500);
            callback && _.isFunction(callback.out) && callback.out(e, this);
        }, this, this);
        return this;
    }
}