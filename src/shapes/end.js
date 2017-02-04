import Utils from './utils';

const type = 'end';
export default {
    type: type,
    fn: function (paper, data, options) {
        // 创建文本
        let text = this.paper.text(0, 0, data.text);
        // 设置属性
        Utils.setAttr(text, options.text);
        let textPadding = options.textPadding || 10;
        // 这只文本对齐方式和x轴坐标
        text.attr({
            'text-anchor': 'start',
            'x': textPadding
        });
        this.shape.push(text);
        let maxWidth = options.maxWidth || 160;
        let words = '';
        // 限制最大宽度
        for (let i = 0, length = data.text.length; i < length; i++) {
            text.attr('text', words + data.text[i]);
            if (text.getBBox().width > maxWidth) {
                words += '\n' + data.text[i];
            } else {
                words += data.text[i];
            }
        }
        // 是否生成链接
        if (data.href) {
            text.attr('href', data.href);
        }
        // 绘制形状
        let tbox = text.getBBox();
        let radius = (options[type] && options[type].radius) || 20;
        let rect = this.paper.rect(0, 0, 0, 0, radius);
        Utils.setAttr(rect, options.shape);
        rect.attr({
            'width': tbox.width + 2 * textPadding,
            'height': tbox.height + 2 * textPadding
        });
        this.shape.push(rect);
        rect.insertBefore(text);
        // 设置文本y轴坐标,使其垂直居中
        text.attr({
            'y': rect.getBBox().height / 2
        });
        this.shape.shape = rect;
        this.shape.text = text;
    }
}