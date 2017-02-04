import start from './start';
import end from './end';
import condition from './condition';
import operation from './operation';
const shapes = [start, end, condition, operation];
const fn = {};
/**
 * 从文件加载shape类型配置
 * 把配置类型挂载到对象的fn属性上
 * shapes  定义好的配置数组集合
 * shapes中的元素结构如下
 * {
 *     type: String, // 类型名称
 *     fn: Function // 执行函数
 * }
 */
for (let i = 0, length = shapes.length; i < length; i++) {
    if (fn[shapes[i].type]) {
        throw new Error(`已经存在[${shapes[i].type}]类型了`);
    }
    fn[shapes[i].type] = shapes[i].fn;
}
export default fn;