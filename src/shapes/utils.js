/**
* 设置对象的属性
* @param {Object} obj    对象
* @param {Object} attrs 属性
*/
function setAttr(obj, attrs) {
    for (let key in attrs) {
        obj.attr(key, attrs[key]);
    }
}
export default {
    setAttr
}