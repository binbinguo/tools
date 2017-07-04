
'use strict';

/**
*构造函数,工具类，考虑兼容性
*/
function Tool() {

}

Tool.prototype = {
    constructor: Tool
};

/**
 *@description 将伪数组转换为数组类型
 *@param {object} s 待转换的伪数组
 *@return {Array}  转换之后的数组
 */
Tool.prototype.toArray = function(s) {
    try {
        return Array.prototype.slice.call(s);
    } catch (e) {
        var arr = [];
        for (var i = 0, len = s.length; i < len; i++) {
            arr[i] = s[i];
        }
        return arr;
    }
};

/**
 *@description 原生通过class name获取node reference
 *@param {String} className 目标类名称
 *@param {context} 文档对象，默认document
 *@return {Array}  转换之后的reference数组
 */
Tool.prototype.getByClass = function(className, context) {
    context = context || document;
    if (context.getElementsByClassName) {
        return context.getElementsByClassName(className);
    } else {
        context = context || document;
        var classes = className.split(" "),
            classesToCheck = [],
            elements = context.getElementsByTagName('*'),
            current,
            returnElements = [],
            match;
        for (var k = 0, kl = classes.length; k < kl; k += 1) {
            classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
        }
        for (var l = 0, ll = elements.length; l < ll; l += 1) {
            current = elements[l];
            match = false;
            for (var m = 0, ml = classesToCheck.length; m < ml; m += 1) {
                match = classesToCheck[m].test(current.className);
                if (!match) {
                    break;
                }
            }
            if (match) {
                returnElements.push(current);
            }
        }
        return returnElements;
    }
};

/**
 *@description 判断目标node是否有目标类
 *@param {reference} node 目标节点引用
 *@param {string} 待判断类名名称
 *@return {Boolean} 判断结果 true 为有
 **/
Tool.prototype.hasClass = function(node, className) {
    var names = node.className.split(/\s+/);
    for (var i = 0, len = names.length; i < len; i++) {
        if (names[i] == className) {
            return true;
        }
    }
    return false;
};