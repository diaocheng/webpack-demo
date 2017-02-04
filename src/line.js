import _ from 'lodash';

export default class Line {
    constructor(paper, line, options) {
        this.paper = paper;
        this.id = line.id;
        this.type = line.type;
        this.from = line.from;
        this.to = line.to;
        this.text = line.text;
        this.data = line.data;
        this.options = options;
        this.render();
        return this;
    }
    /**
     * 获取线条起始数据
     * 并指定线段中间点
     * 调用连接函数渲染线条
     * @return {Line} self
     */
    render() {
        // 起始元素的各个可能连接点坐标
        const from = {
            top: this.from.top,
            right: this.from.right,
            bottom: this.from.bottom,
            left: this.from.left,
            center: this.from.center
        }
        // 终止元素的各个可能连接点坐标
        const to = {
            top: this.to.top,
            right: this.to.right,
            bottom: this.to.bottom,
            left: this.to.left,
            center: this.to.center
        }
        // 设置连接中间转折点坐标
        let dx = from.center.x - to.center.x;
        let dy = from.center.y - to.center.y;
        let x = -dx;
        let y = dy;
        // 线段起始位置
        let line = {};
        // 线段转折位置
        let point = [];
        // 判断连接关系是左右还是上下
        if (Math.abs(dx) < Math.abs(dy)) {
            // 判断上下关系
            if (y > 0) {
                line.from = from.top;
                line.to = to.bottom;
            } else {
                line.from = from.bottom;
                line.to = to.top;
            }
            // 重新计算转折点位置
            dx = line.from.x - line.to.x;
            dy = line.from.y - line.to.y;
            x = -dx;
            y = dy;
            point = [
                { x: line.from.x, y: line.from.y - y / 2 },
                { x: line.from.x + x / 2, y: line.from.y - y / 2 },
                { x: line.from.x + x, y: line.from.y - y / 2 }
            ];
        } else {
            // 判断左右关系
            if (x < 0) {
                line.from = from.left;
                line.to = to.right;
            } else {
                line.from = from.right;
                line.to = to.left;
            }
            // 重新计算转折点位置            
            dx = line.from.x - line.to.x;
            dy = line.from.y - line.to.y;
            x = -dx;
            y = dy;
            point = [
                { x: line.from.x + x / 2, y: line.from.y },
                { x: line.from.x + x / 2, y: line.from.y - y / 2 },
                { x: line.from.x + x / 2, y: line.from.y - y }
            ];
        }
        this.drawLine(line, point);
        return this;
    }
    /**
     * 获取线条起始数据
     * 并指定线段中间点
     * 调用连接函数重新渲染线条
     * @return {Line} self
     */
    refresh() {
        this.render();
        return this;
    }
    /**
     * 绘制线条
     * 当线条存在时
     * 更新线条,防止重复绘制
     * @param  {Object} line  path的起始位置
     * @param  {Array} point  中间点坐标
     * @return {Line} self
     */
    drawLine(line, point) {
        let path = ['M', line.from.x, line.from.y, 'L'];
        let textPoint = {
            x: (line.from.x + line.to.x) / 2,
            y: (line.from.y + line.to.y) / 2
        };
        for (let i = 0, length = point.length; i < length; i++) {
            path.push(point[i].x, point[i].y);
        }
        path.push(line.to.x, line.to.y);
        if (!this.line) {
            this.line = this.paper.set();
            // 绘制文本
            if (this.text) {
                this.line.text = this.paper.text(0, 0, this.text);
                this.line.text.attr({
                    'text-anchor': 'start'
                });
                // 限制最大宽度
                let words = '';
                let maxWidth = this.options.maxWidth || 120;
                for (let i = 0, length = this.text.length; i < length; i++) {
                    this.line.text.attr('text', words + this.text[i]);
                    if (this.line.text.getBBox().width > maxWidth) {
                        words += '\n' + this.text[i];
                    } else {
                        words += this.text[i];
                    }
                }
                for (let key in this.options.line.text) {
                    this.line.text.attr(key, this.options.line.text[key]);
                }
                this.line.push(this.line.text);
            }
            // 绘制曲线
            this.line.path = this.paper.path(path);
            for (let key in this.options.line.line) {
                this.line.path.attr(key, this.options.line.line[key]);
            }
            this.line.push(this.line.path);
        } else {
            this.line.path.attr({
                path: path
            });
        }
        if (this.line.text) {
            // 设置文字位置
            let x = textPoint.x - this.line.text.getBBox().width / 2;
            // 让文字位于中间
            let y = textPoint.y;
            this.line.text.transform(`t${x},${y}`);
        }
        return this;
    }
}