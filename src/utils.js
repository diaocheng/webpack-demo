/**
 * 把传进来的数据转置为按level排列的二维数组
 * @param  {Array} data 源数据
 * [
 *     0,----> 0 => {id: nubmer, to: [id, id], level: nubmber, el: [{el}, {el}, ...]}
 *     1,----> 1 => {id: nubmer, to: [id, id], level: nubmber, el: [{el}, {el}, ...]}
 *     ...
 * ] 
 * @return {Array}
 * [
 *     [0-1],----> 0-1 => [origin data]
 *     [1-1, 1-2],----> 1-1 => [origin data, origin data] | 1-2 => [origin data, origin data]
 *     ...
 * ]
 */
let dataProcessing = function (data) {
    // 按level排序
    let _data = data.sort(function (prev, next) {
        if (prev.level <= next.level) {
            return false;
        }
        return true;
    });

    let levels = {};
    // 把数据做成按层级增长的对象
    // 数据结构如下
    // {
    //     0: [0-1],----> 0-1 => [origin data]
    //     1: [1-1, 1-2],----> 1-1 => [origin data, origin data] | 1-2 => [origin data, origin data]
    //     ...
    // }
    for (let i = 0; i < _data.length; i++) {
        if (!levels[_data[i].level]) {
            levels[_data[i].level] = [];
        }
        levels[_data[i].level].push(_data[i]);
    }
    // 把对象转换为数组
    let _temp = [];
    for (let key in levels) {
        levels[key] = levels[key].sort(function (prev, next) {
            if (prev.id <= next.id) {
                return false;
            }
            return true;
        });
        _temp.push(levels[key]);
    }
    return _temp;
}
export default {
    dataProcessing
}