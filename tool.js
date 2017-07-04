
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

/**
 *@description 目标node添加类
 *@param {reference} el 目标节点引用
 *@param {string} name 待添加类名名称
 *@return null
 **/
Tool.prototype.addClass = function(el, name) {
    if (!el) {
        return;
    }
    if (!this.hasClass(el, name)) {
        el.className += (el.className ? ' ' : '') + name;
    }
};

/**
 *@description 目标node移除类
 *@param {reference} el 目标节点引用
 *@param {string} name 待移除类名名称
 *@return null
 **/
Tool.prototype.removeClass = function(el, name) {
    if (!el) {
        return;
    }
    if (this.hasClass(el, name)) {
        el.className = el.className.replace(new RegExp('(\\s|^)' + name + '(\\s|$)'), ' ').replace(/^\s+|\s+$/g, '');
    }
};

/**
 *@description 目标node添加事件
 *@param {reference} obj 目标节点引用
 *@param {string} type 目标类型
 *@param {Function} fn 回调函数
 *@return null
 **/
Tool.prototype.addEvent = function addEvent(obj, type, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(type, fn, false);
        this.EventCache.add(obj, type, fn);
    } else if (obj.attachEvent) {
        obj["e" + type + fn] = fn;
        obj[type + fn] = function() {
            obj["e" + type + fn](window.event);
        };
        obj.attachEvent("on" + type, obj[type + fn]);
        this.EventCache.add(obj, type, fn);
    } else {
        obj["on" + type] = obj["e" + type + fn];
    }
};
/**
 *@description 事件缓存****有待验证
 *@param {reference} obj 目标节点引用
 *@param {string} type 目标类型
 *@param {Function} fn 回调函数
 *@return null
 **/
Tool.prototype.EventCache = (function() {
    var listEvents = [];
    return {
        listEvents: listEvents,
        add: function(node, sEventName, fHandler) {
            listEvents.push(arguments);
        },
        flush: function() {
            var i, item;
            for (i = listEvents.length - 1; i >= 0; i = i - 1) {
                item = listEvents[i];
                if (item[0].removeEventListener) {
                    item[0].removeEventListener(item[1], item[2], item[3]);
                }
                if (item[1].substring(0, 2) != "on") {
                    item[1] = "on" + item[1];
                }
                if (item[0].detachEvent) {
                    item[0].detachEvent(item[1], item[2]);
                }
                item[0][item[1]] = null;
            }
        }
    };
})();


/**
 *@description 移除事件
 *@param {reference} obj 目标节点引用
 *@param {string} type 目标类型
 *@param {Function} fn 回调函数
 *@return null
 **/
Tool.prototype.removeEvent = function removeEvents(target, type, func) {
    if (target.removeEventListener) {
        target.removeEventListener(type, func, false);
    } else if (target.detachEvent) {
        target.detachEvent("on" + type, func);
    } else {
        target["on" + type] = null;
    }
};
/**
 *@description 通过class激活
 *@param {reference} refs 目标节点引用
 *@param {number} index 目标索引
 *@param {String} className 添加类名
 *@return null
 **/
Tool.prototype.activeByClass = function(refs, index, className) {
    if (!refs || !className) {return;}
    for (var i = 0; i < refs.length; i++) {
        this.removeClass(refs[i], className);
    }
    this.addClass(refs[index], className);
};

/**
 *@description 通过class激活
 *@param {Object} options Ajax 参数
 *@return null
 **/
Tool.prototype.ajax = function ajax(options) {
    options = options || {};
    options.type = (options.type || "GET").toUpperCase();
    options.dataType = options.dataType || "json";
    var params = this.formatParams(options.data),
        xhr;

    //创建 - 非IE6 - 第一步
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else { //IE6及其以下版本浏览器
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }

    //接收 - 第三步
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var status = xhr.status;
            if (status >= 200 && status < 300) {
                options.success && options.success(xhr.responseText, xhr.responseXML);
            } else {
                options.fail && options.fail(status);
            }
        }
    };

    //连接 和 发送 - 第二步
    if (options.type == "GET") {
        xhr.open("GET", options.url + "?" + params, true);
        xhr.send(null);
    } else if (options.type == "POST") {
        xhr.open("POST", options.url, true);
        //设置表单提交时的内容类型
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(params);
    }
};