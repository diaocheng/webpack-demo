import Utils from './utils';

const type = 'condition'
export default {
    type: type,
    fn: function (paper, data, options) {
        // 创建文本
        let text = this.paper.text(0, 0, data.text);
        // 设置属性
        Utils.setAttr(text, options.text);
        let textPadding = options.textPadding || 10;
        // 这只文本对齐方式
        text.attr({
            'text-anchor': 'start'
        });
        this.shape.push(text);
        // 设置最大宽度
        let maxWidth = options.maxWidth || 120;
        let words = '';
        // 设置文本最大宽度
        for (let i = 0, length = data.text.length; i < length; i++) {
            text.attr('text', words + data.text[i]);
            if (text.getBBox().width > maxWidth) {
                words += '\n' + data.text[i];
            } else {
                words += data.text[i];
            }
        }
        // 判断是否有链接
        if (data.href) {
            text.attr('href', data.href);
        }

        let tbox = text.getBBox();

        // 设置文本与边框的距离
        let width = tbox.width + 3 * textPadding;
        width += width / 2;
        let height = tbox.height + 2 * textPadding;
        height += height / 2;
        height = Math.max(width * 0.5, height);
        let startX = width / 4;
        let startY = height / 4;
        text.attr({
            'x': startX + textPadding / 2
        });
        // 设置绘制轮廓的数据
        let start = { x: startX, y: startY };
        let points = [
            { x: startX - width / 4, y: startY + height / 4 },
            { x: startX - width / 4 + width / 2, y: startY + height / 4 + height / 2 },
            { x: startX - width / 4 + width, y: startY + height / 4 },
            { x: startX - width / 4 + width / 2, y: startY + height / 4 - height / 2 },
            { x: startX - width / 4, y: startY + height / 4 }
        ];
        // 绘制轮廓
        let path = drawPath(this.paper, start, points, options);
        // 把元素擦入到文本之前
        // 以使文本位于上层
        path.insertBefore(text);
        // 设置文本y坐标,使其处于水平居中
        text.attr({
            'y': path.getBBox().height / 2
        });
        this.shape.push(path);
        this.shape.shape = path;
        this.shape.text = text;
    }
}
function drawPath(chart, start, points, options) {
    let i, len;
    let path = 'M{0},{1}';
    for (i = 2, len = 2 * points.length + 2; i < len; i += 2) {
        path += ' L{' + i + '},{' + (i + 1) + '}';
    }
    let pathValues = [start.x, start.y];
    for (i = 0, len = points.length; i < len; i++) {
        pathValues.push(points[i].x);
        pathValues.push(points[i].y);
    }
    let symbol = chart.path(path, pathValues);
    Utils.setAttr(symbol, options.shape);
    return symbol;
}