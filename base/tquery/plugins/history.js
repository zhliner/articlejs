//! $Id: history.js 2020.06.18 tQuery.Plugins $
//+++++++++++++++++++++++++++++++++++++++++++++++
//  Project: dom-history v0.1.0
//  E-Mail:  zhliner@gmail.com
//  Copyright (c) 2020 - 2021 铁皮工作室  MIT License
//
//////////////////////////////////////////////////////////////////////////////
//
//  节点树修改监听/记录历史。
//  利用 tQuery 节点变化定制事件机制，跟踪对节点的修改，创建历史记录以便于撤销。
//
//  改变之前的事件可能因为其它处理器阻止改变，所以需要监听改变后的事件，
//  它们包括：
//  - 特性变化：attrdone
//  - 属性变化：propdone
//  - 样式变化：styledone
//  - 类名变化：classdone
//  - 内容变化：nodeok, detached, emptied, normalized
//
//  - 事件处理绑定变化：bound, unbound
//
//  适用前提
//  --------
//  限于tQuery接口调用，如果用户直接调用DOM接口修改节点则无法跟踪。
//
//  使用：
//  - 配置 tQuery.config() 以支持定制事件的激发。
//  - 创建一个全局的 History 实例作为事件处理器，绑定上面的事件到目标根元素上。
//  - 籍由事件的触发，会自动记录该元素及其子孙元素的变化历史。
//  - 调用 .back(n) 即可回退 DOM 的变化。
//
//  注意：
//  back即为undo的逻辑，redo需要用户自己编写（比如操作实例化）。
//  监听事件通常绑定在上层容器上，因此脱离节点树的节点的变化无法监听。
//
//
///////////////////////////////////////////////////////////////////////////////
//


(function( $ ) {
    //
    // 变化处理器映射。
    // event-name: function(event): {.back}
    //
    const __varyHandles = {
        // 简单值变化。
        attrdone:   ev => new Attr( ev.target, ev.detail ),
        propdone:   ev => new Prop( ev.target, ev.detail ),
        styledone:  ev => new Style( ev.target, ev.detail ),
        classdone:  ev => new Class( ev.target, ev.detail ),

        // 节点变化。
        // 共需记录4种情形。
        nodesdone:  ev => new Nodesdone( ev.detail[0] ),
        detached:   ev => new Remove( ev.target, ev.detail ),
        emptied:    ev => new Empty( ev.target, ev.detail ),
        // 事前拦截。
        normalize:  ev => new Normalize( ev.target, ev ),

        // 事件绑定变化。
        bound:      ev => new Bound( ev.target, ...ev.detail ),
        unbound:    ev => new Unbound( ev.target, ...ev.detail ),
    };



//
// 历史记录器。
// 汇集节点改变的回溯（.back）操作实例。
//
class History {
    /**
     * 构造一个记录器。
     * 缓存池长度由外部管理（.prune）。
     */
    constructor() {
        this._buf = [];
    }


    /**
     * 事件触发处理器。
     * @param {CustomEvent} ev 定制事件对象
     */
    handleEvent( ev ) {
        // 仅记录一次。
        ev.stopPropagation();

        this._buf.push( __varyHandles[ev.type](ev) );
    }


    /**
     * 回溯操作。
     * @param {Number} n 回溯项数
     */
    back( n ) {
        n > 0 && callBack( () => this._backs(this._buf, n) );
    }


    /**
     * 获取当前缓存池大小。
     * @return {Number}
     */
    size() {
        return this._buf.length;
    }


    /**
     * 缓存池头部剪除。
     * @param {Number} n 清除数量
     */
    prune( n ) {
        if ( n > 0 ) {
            this._buf.splice( 0, n );
        }
    }


    /**
     * 清空缓存池。
     * @return {void}
     */
    clear() {
        this._buf.length = 0;
    }


    /**
     * 批量回退。
     * @param {[.back]} buf 实例集引用
     * @param {Number} n 回退数量
     */
    _backs( buf, n ) {
        buf.splice( -n )
        .reverse()
        .forEach( obj => obj.back() );
    }
}


//
// 基础操作类。
// 注意：调用回退（.back）接口时需要关闭定制事件激发。
///////////////////////////////////////////////////////////////////////////////


//
// 元素特性修改。
// 关联事件：attrdone
//
class Attr {
    /**
     * 注：name已为完整的名称。
     * @param {Element} el 目标元素
     * @param {String} name 目标特性名（最终）
     * @param {String|null} val 之前的值
     */
    constructor( el, [name, val] ) {
        this._el = el;
        this._name = name;
        this._old = val;
    }


    back() {
        if ( this._old === null ) {
            return this._el.removeAttribute( this._name );
        }
        this._el.setAttribute( this._name, this._old );
    }
}


//
// 元素属性修改。
// 关联事件：propdone
//
class Prop {
    /**
     * val为数组时，操作的是<select multiple>
     * @param {Element} el 目标元素
     * @param {String} name 目标属性名（最终）
     * @param {Value|[Value]} val 之前的值
     * @param {Boolean} dname 是否为data名称（驼峰式）
     */
    constructor( el, [name, val, dname] ) {
        this._el = el;
        this._name = name;
        this._old = val;
        this._isdn = dname;
    }


    back() {
        if ( this._isdn ) {
            this._el.dataset[ this._name ] = this._old;
        } else {
            this._el[ this._name ] = this._old;
        }
    }
}


//
// 内联样式修改。
// 关联事件：styledone
//
class Style {
    /**
     * @param {Element} el 目标元素
     * @param {String} name 样式属性名
     * @param {String} val 之前的样式值（已规范）
     */
    constructor( el, [name, val] ) {
        this._el = el;
        this._name = name;
        this._old = val;
    }


    // 注记：
    // 浏览器在设置样式时会自动调整style特性值本身。
    // 因此这里并不寻求恢复style的原始特性值。
    back() {
        this._el.style[ this._name ] = this._old;
    }
}


//
// 元素类名修改。
// 关联事件：classdone
//
class Class {
    /**
     * @param {Element} el 目标元素
     * @param {[String]} ns 类名集
     * @param {String} meth 方法（add|remove|toggle）
     */
    constructor( el, [ns, meth] ) {
        this._el = el;
        this._ns = ns;
        this._meth = meth;
    }


    back() {
        switch ( this._meth ) {
            case 'add':
                return this._backs( 'remove' );
            case 'remove':
                return this._backs( 'add' );
            case 'toggle':
                return this._backs( 'toggle' );
        }
    }


    /**
     * 匹配回退。
     * @param {String} meth 操作方法
     */
    _backs( meth ) {
        let _cls = this._el.classList;

        this._ns.forEach(
            n => _cls[ meth ]( n )
        );
        if ( !_cls.length ) this._el.removeAttribute( 'class' );
    }
}


//
// 事件已绑定。
// 关联事件：bound
//
class Bound {
    /**
     * 注记：
     * 无需区分是否为单次（one）绑定，所以once参数仅为占位用。
     * @param {Element} el 目标元素
     * @param {String} evn 目标事件名
     * @param {String} slr 委托选择器
     * @param {Function|EventListener} handle 事件处理器（用户）
     * @param {Boolean} cap 是否为捕获
     */
    constructor( el, evn, slr, handle, cap ) {
        this._el = el;
        this._evn = evn;
        this._slr = slr;
        this._handle = handle;
        this._cap = cap;
    }


    /**
     * 如果为克隆绑定，由EventClone处理。
     */
    back() {
        $.off(
            this._el,
            this._evn, this._slr, this._handle,
            this._cap
        );
    }
}


//
// 事件已解绑。
// 关联事件：unbound
//
class Unbound {
    /**
     * @param {Element} el 目标元素
     * @param {String} evn 目标事件名
     * @param {String} slr 委托选择器
     * @param {Function|EventListener} handle 事件处理器（用户）
     * @param {Boolean} cap 是否为捕获
     * @param {Boolean} once 是否为单次绑定
     */
    constructor( el, evn, slr, handle, cap, once ) {
        this._el = el;
        this._evn = evn;
        this._slr = slr;
        this._handle = handle;
        this._cap = cap;
        this._once = once;
    }


    back() {
        let _fn = this._once ?
            'one' :
            'on';
        $[_fn]( this._el, this._evn, this._slr, this._handle, this._cap );
    }
}



//
// 节点操作类。
// 因为DOM节点是移动式操作，故仅需记录节点的脱离行为。
//////////////////////////////////////////////////////////////////////////////


//
// 节点已进入。
// 关联事件：nodesdone
// 数据节点已事先脱离DOM。
// 适用方法：.prepend, .append, .before, .after, replace
//
class Nodesdone {
    /**
     * @param {[Node]} nodes 已插入节点集
     */
    constructor( nodes ) {
        this._nodes = nodes;
    }


    back() {
        this._nodes.forEach( nd => nd.remove() );
    }
}


//
// 节点已移除。
// 关联事件：detached
// 节点在DOM中（否则不会触发）。
//
class Remove {
    /**
     * @param {Element|DocumentFragment} box 已移除节点的原父节点
     * @param {Node} node 已移除的节点
     * @param {Node|null} prev 原前一个节点
     */
    constructor( box, [node, prev] ) {
        this._box = box;
        this._node = node;
        this._prev = prev;
    }


    back() {
        if ( this._prev ) {
            return this._prev.after( this._node );
        }
        this._box.prepend( this._node );
    }
}


//
// 元素已清空。
// 关联事件：emptied
// 注记：
// 已经为空的元素不会触发事件。
//
class Empty {
    /**
     * @param {Element} el 容器元素
     * @param {[Node]} subs 子节点集
     */
    constructor( el, subs ) {
        this._box = el;
        this._data = subs;
    }


    back() {
        this._box.prepend( ...this._data );
    }
}


//
// 元素规范化之前。
// 关联事件：normalize
// 处理.normalize()将有的变化。
//
class Normalize {
    /**
     * 提取相邻文本节点集分组。
     * 对每一组提前处理。
     * @param {Element} el 事件主元素
     * @param {Event} ev 事件对象
     */
    constructor( el, ev ) {
        // 自行负责。
        ev.preventDefault();

        let _all = textNodes( el )
            .filter(
                (nd, i, arr) => adjacent(nd, arr[i - 1], arr[i + 1])
            );
        this._buf = adjacentTeam(_all).map( nodes => new Texts(nodes) );
    }


    back() {
        this._buf.forEach( obj => obj.back() );
    }
}


//
// 相邻文本节点处理。
// 保留首个节点引用，与浏览器的处理相似。
// 注：
// 上级用户已调用了Event.preventDefault()。
//
class Texts {
    /**
     * nodes为一组相邻文本节点集。
     * @param {[Text]} nodes 节点集
     */
    constructor( nodes ) {
        let _ref = nodes.shift(),
            _all = _ref.wholeText,
            _txt = _ref.textContent;

        nodes.forEach(
            nd => nd.remove()
        );
        _ref.textContent = _all;

        this._node = _ref;
        this._text = _txt;
        this._data = nodes;
    }


    back() {
        this._node.textContent = this._text;
        this._node.after( ...this._data );
    }
}


//
// 工具函数
///////////////////////////////////////////////////////////////////////////////


/**
 * 提取元素内的文本节点。
 * @param  {Element} el 容器元素
 * @param  {Array} buf 缓存区
 * @return {[Node]}
 */
function textNodes( el, buf = [] ) {
    for (const nd of el.childNodes) {
        let _t = nd.nodeType;
        if ( _t === 1 ) textNodes( nd, buf );
        else if ( _t === 3 ) buf.push( nd );
    }
    return buf;
}


/**
 * 相邻节点过滤器。
 * 检查集合中的节点是否为相邻节点。
 * @param  {Node} cur 当前节点
 * @param  {Node|undefined} prev 集合中前一个节点
 * @param  {Node|undefined} next 集合中下一个节点
 * @return {Boolean}
 */
function adjacent( cur, prev, next ) {
    // null !== undefined
    return cur.previousSibling === prev || cur.nextSibling === next;
}


/**
 * 相邻节点集分组。
 * 源节点集中包含了多组不同的相邻节点。
 * @param  {[Node]} nodes 有序节点集
 * @return {[[Node]]}
 */
function adjacentTeam( nodes ) {
    if ( nodes.length == 0 ) {
        return [];
    }
    let _sub = [nodes.shift()],
        _buf = [_sub];

    for ( const nd of nodes ) {
        if ( nd.previousSibling === _sub[_sub.length-1] ) {
            _sub.push( nd );
            continue;
        }
        _buf.push( (_sub = [nd]) );
    }
    return _buf;
}


/**
 * 调用回溯函数。
 * 需要临时关闭节点变化跟踪。
 * @param {Function} handle 回调操作
 */
function callBack( handle ) {
    let _old = $.config({
        varyevent: null,
        bindevent: null,
    });
    try {
        return handle();
    }
    finally { $.config( _old ) }
}



// Expose
///////////////////////////////////////////////////////////////////////////////

$.Fx.History = History;

// 友好导出备用。
$.Fx.History.Normalize = Normalize;


})( window.$ );
