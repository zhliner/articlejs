//! $Id: create.js 2019.09.07 Articlejs.Libs $
//++++++++++++++++++++++++++++++++++++++++++++++
// 	Project: Articlejs v0.1.0
//  E-Mail:  zhliner@gmail.com
// 	Copyright (c) 2019 - 2020 铁皮工作室  MIT License
//
//////////////////////////////////////////////////////////////////////////////
//
//	内容单元创建。
//
//  单元的容器和内容条目分开创建，以便于容器可以接收既有的内容条目（如移动传入）。
//  单元容器的创建是通用的（依配置），内容插入则有各自的限定。
//
//  注记：
//  从简化和宽容性考虑，分级片区和行块内容可以同时存在于同一层级（相同父元素）。
//  虽然传统上或从清晰的逻辑上看不应如此，但CSS样式的能力可以让它们被清晰区分开来。
//
//  这种宽容可以提供编辑时的便捷：
//  - 可以在内容片区插入合法的分级片区，方便将内容行块移入该新片区。
//  - 可以将分级片区解包到当前位置成为内容，这样其它兄弟分级片区的转换就很正常了。
//  - 是否在最终的文档中让两者混合出现是作者的选择，作者可以选择清晰的分层结构，抑或不。
//
//
///////////////////////////////////////////////////////////////////////////////
//

import { type, nameType, tableObj } from "./base.js";
import { SVG, SVGITEM } from "./types.js";
import { extend } from "./tpb/pbs.by.js";


const
    $ = window.$,

    // 类型值存储键。
    __typeKey = Symbol('type-value');


//
// 简单默认消息。
//
const
    __msgAudio = "Sorry, your browser doesn't support embedded audios.",
    __msgVideo = "Sorry, your browser doesn't support embedded videos.";


/**
 * 创建单元（通用）。
 * 类型值会被存储，以使得不需要每次都检查判断。
 * 注：不含文本节点和svg创建。
 * @param  {String} tag 标签名
 * @param  {Object} opts 特性配置对象，可选
 * @param  {String} name 单元类型名，可选
 * @return {Element}
 */
function create( tag, opts, name ) {
    let _el = $.Element( tag );

    if ( opts ) {
        $.attribute( _el, opts );
    }
    return setType( _el, nameType(name || tag.toUpperCase()) );
}


/**
 * 存储元素类型值。
 * 注：用一个Symbol键存储在元素对象上，非枚举。
 * @param  {Element} el 目标元素
 * @param  {Number} tval 类型值
 * @return {Element} el
 */
function setType( el, tval ) {
    Reflect.defineProperty(el, __typeKey, {
        value: tval,
        enumerable: false,
    });
    return el;
}


/**
 * 提取元素类型值。
 * 如果值未知，即时分析获取并存储。
 * @param  {Element} el 目标元素
 * @return {Number}
 */
function getType( el ) {
    let _v = el[ __typeKey ];

    if ( _v === undefined ) {
        setType( el, (_v = type(el)) );
    }
    return _v;
}


/**
 * 克隆元素。
 * 仅用于内容单元，因此是完整克隆（深度）。
 * 包括元素（自身）上注册的事件处理器和类型的值。
 * @param  {Element} src 源元素
 * @return {Element} 新元素
 */
function clone( src ) {
    let _new = $.clone( src, true );
    return setType( _new, getType(src) );
}


//
// 单元创建集。
// 包含全部中间结构单元。
// 用于主面板中的新单元构建和复制/移动时的默认单元创建。
//////////////////////////////////////////////////////////////////////////////
// 注记：
// 除非为最基本单元，实参尽量为节点/集以便于移动转换适用。
// 返回节点集时，如果目标为集合，可实现一一对应插入。
//
const Content = {

    //-- 内联单元 ------------------------------------------------------------

    /**
     * 创建音频单元。
     * @param  {Object} opts 属性配置集
     * @return {Element}
     */
    audio( opts = {} ) {
        opts.text = __msgAudio;
        return create( 'audio', opts );
    },


    /**
     * 创建视频单元。
     * @param  {Object} opts 属性配置集
     * @return {Element}
     */
    video( opts = {} ) {
        opts.text = __msgVideo;
        return create( 'video', opts );
    },


    /**
     * 创建兼容图片。
     * @param  {Element} img 图片元素
     * @param  {[Element]} sources 兼容图片源元素
     * @return {Element}
     */
    picture( img, sources ) {
        let _el = create( 'picture' );

        $.append( _el, sources.concat(img) );
        return _el;
    },


    /**
     * 创建SVG单元。
     * opts通常是必须的。
     * @param  {Object} opts 属性配置集
     * @param  {String} xml SVG源码，可选
     * @return {Element}
     */
    svg( opts = {}, xml = '' ) {
        if ( xml ) {
            opts.html = xml;
        }
        let _el = $.svg( opts );

        $.find('*', _el)
        .forEach( el => setType(el, SVGITEM) );

        return setType( _el, SVG );
    },


    /**
     * 创建注音单元。
     * 注意实参传递的顺序。
     * @param  {Element} rb 注音字
     * @param  {Element} rt 注音
     * @param  {Element} rp1 左包围
     * @param  {Element} rp2 右包围
     * @return {Element}
     */
    ruby( rb, rt, rp1, rp2 ) {
        let _el = create( 'ruby' );

        $.append( _el, [rb, rp1, rt, rp2] )
        return _el;
    },


    /**
     * 创建时间单元。
     * 文本为空时即默认为datetime的标准格式文本。
     * date/time通常至少需要一个有值。
     * @param  {String} text 时间表达文本，可选
     * @param  {String} date 日期表达串，可选
     * @param  {String} time 时间表达串，可选
     * @return {Element}
     */
    time( text, date, time ) {
        let dt = '';

        if ( date ) dt = date;
        if ( time ) dt = dt ? `${dt} ${time}` : `${time}`;

        return create( 'time', {text: text || dt, datetime: dt || null} );
    },


    /**
     * 创建量度标示。
     * 注：!!'0' => true
     * @param  {String} val 数量
     * @param  {String} max 最大值，可选
     * @param  {String} min 最小值，可选
     * @param  {String} high 高值，可选
     * @param  {String} low 低值，可选
     * @param  {String} opm 最优值，可选
     * @return {Element}
     */
    meter( val, max, min, high, low, opm ) {
        let opts = { value: val };

        if ( max ) opts.max = max;
        if ( min ) opts.min = min;
        if ( high ) opts.high = high;
        if ( low ) opts.low = low;
        if ( opm ) opts.optimum = opm;

        return create( 'meter', opts );
    },


    /**
     * 创建空白段。
     * @param  {Number} n 数量
     * @param  {String} width 宽度
     * @return {Element|[Element]}
     */
    space( n, width ) {
        let _els = handleCalls( n, create, 'space' );

        if ( width != null ) {
            _els.forEach( el => $.css(el, 'width', width) );
        }
        return _els.length == 1 ? _els[0] : _els;
    },


    /**
     * 创建换行。
     * @param  {Number} n 数量
     * @return {Element|[Element]}
     */
    br( n ) {
        let _els = handleCalls( n, create, 'br' );
        return _els.length == 1 ? _els[0] : _els;
    },


    /**
     * 创建软换行。
     * @param  {Number} n 数量
     * @return {Element|[Element]}
     */
    wbr( n ) {
        let _els = handleCalls( n, create, 'wbr' );
        return _els.length == 1 ? _els[0] : _els;
    },


    /**
     * 创建注音内容组。
     * 返回集成员顺序与ruby()实参顺序一致。
     * rp1和rp2必须成对出现。
     * 注记：
     * 仅用于ruby完整子单元封装，不存储单元类型值（因为无法从DOM中选取）。
     * 具体各子单元的创建由相应的方法完成。
     * @param  {Element} rb 注音文本
     * @param  {Element} rt 注音拼音
     * @param  {Element} rp1 左包围，可选
     * @param  {Element} rp2 右包围，可选
     * @return {[Element]}
     */
    rbpt( rb, rt, rp1, rp2 ) {
        let _els = [ rb, rt ];

        if ( rp1 && rp2 ) {
            _els.push( rp1, rp2 );
        }
        return _els;
    },


    /**
     * 创建代码单元。
     * 对内部的<b><i>不设置类型值，
     * 因为内部的语法单元是即时解析和构建的。
     * opts: {data-lang, data-tab}
     * @param  {Node|[Node]|String} cons 单元内容
     * @param  {Object} opts 属性配置，可选
     * @return {Element}
     */
    code( cons, opts ) {
        let _el = create( 'code', opts ),
            _fn = typeof cons === 'string' ? 'html' : 'append';

        return $[_fn]( _el, cons ), _el;
    },


    //-- 块内结构元素 --------------------------------------------------------


    /**
     * 创建表格行。
     * 内容可以是一个二维数组，一维成员对应到各单元格。
     * @param  {Table} tbl 表格实例（$.Table）
     * @param  {[Node|[Node]|String]} cons 内容集
     * @param  {TableSection} tsec 表格片区（<thead>|<tbody>|<tfoot>）
     * @param  {Number} idx 位置下标，可选
     * @return {Collector} 新行元素集
     */
    tr( tbl, cons, tsec, idx ) {
        let _rows = Math.ceil( cons.length / tbl.columns() ),
            _trs = null;

        switch (tsec.tagName) {
            case 'THEAD':
                _trs = tbl.head(_rows, idx);
                break;
            case 'TFOOT':
                _trs = tbl.foot(_rows, idx);
                break;
            case 'TBODY':
                _trs = tbl.body(_rows, idx, tsec);
        }
        return _trs.find('th,td').flat().fill( cellWraps(cons) ).end(-1);
    },


    /**
     * 创建/更新表头元素。
     * 需要实际的表格行数据，可作为重复添加接口。
     * @param  {Table} tbl 表格实例（$.Table）
     * @param  {[Node|[Node]|String]} cons 内容集
     * @param  {Number} idx 插入位置下标
     * @return {Collector} 新行元素集
     */
    thead( tbl, cons, idx ) {
        let _rows = Math.ceil( cons.length / tbl.columns() ),
            _trs = tbl.head( _rows, idx );

        return _trs.find('th').flat().fill( cellWraps(cons) ).end(-1);
    },


    /**
     * 创建表格行。
     * 内容可以是一个二维数组，一维成员对应到各单元格。
     * @param  {Table} tbl 表格实例（$.Table）
     * @param  {[Node|[Node]|String]} cons 内容集
     * @param  {Number} idx 位置下标，可选
     * @param  {TableSection} tsec 表体片区（<tbody>[n]），可选
     * @return {Collector} 新行元素集
     */
    tbody( tbl, cons, idx, tsec ) {
        let _rows = Math.ceil( cons.length / tbl.columns() ),
            _trs = tbl.body( _rows, idx, tsec );

        return _trs.find('th,td').flat().fill( cellWraps(cons) ).end(-1);
    },


    /**
     * 创建/更新表脚元素。
     * 需要实际的表格行数据，可作为重复添加接口。
     * @param  {Table} tbl 表格实例（$.Table）
     * @param  {[Node|[Node]|String]} cons 内容集
     * @param  {Number} idx 插入位置下标
     * @return {Collector} 新行元素集
     */
    tfoot( tbl, cons, idx ) {
        let _rows = Math.ceil( cons.length / tbl.columns() ),
            _trs = tbl.foot( _rows, idx );

        return _trs.find('th,td').flat().fill( cellWraps(cons) ).end(-1);
    },


    //-- 行块结构元素 --------------------------------------------------------


    /**
     * 创建标题/组。
     * 如果未传递副标题，简单返回<h1>元素。
     * @param {Element} h1 主标题
     * @param {Element} h2 副标题，可选
     */
    hgroup( h1, h2 ) {
        if ( h2 == null ) {
            return h1;
        }
        let _hg = create( 'hgroup' );

        $.prepend( _hg, [h1, h2] );
        return _hg;
    },


    /**
     * 创建表格。
     * 会缓存$.Table实例。
     * @param  {Element} caption 表标题
     * @param  {Number} rows 行数
     * @param  {Number} cols 列数
     * @param  {Number} vth 列表头（1|-1），可选
     * @return {Element}
     */
    table( caption, rows, cols, vth ) {
        let _tbo = $.table( rows, cols, vth ),
            _tbl = _tbo.element();

        if ( caption ) {
            $.prepend( _tbl, caption );
        }
        return tableObj( _tbo ), _tbl;
    },


    /**
     * 创建隔断。
     * css:
     * - borderWidth 厚度
     * - width 长度
     * - height 空白
     * @param  {Object} css 样式配置
     * @return {Element}
     */
    hr( css ) {
        let _hr = create( 'hr' );
        return $.cssSets( _hr, css );
    },


    //-- 特别用途元素 --------------------------------------------------------
    // 注：由特定的函数创建（解析/构建）。

    // b( text ) {},
    // i( text ) {},




    /**
     * 目录构建。
     * 约束：片区必须紧随其标题元素。
     * 目标标签为节点类型，故可支持事件绑定或简单设置为主标题锚点。
     * @param  {Element} article 文章元素
     * @param  {Node|[Node]} label 目录标签（h4/..）
     * @return {Element} 目录根元素
     */
    Toc( article, label ) {
        let _toc = create( 'Toc' );

        $.append(
            _toc.firstElementChild,
            label || $.Text('Contents')
        );
        return tocList( _toc.lastElementChild, article );
    },


    /**
     * 文章结构。
     * article/[h2, section:s1]...
     * 文章内容包含章片区集或内容件集（互斥关系）。
     * 原为章片区：
     *  - 新章片区：简单添加，外部同级保证。
     *  - 新内容件：新建一章片区封装插入。
     * 原为内容件：
     *  - 新章片区：新建一章片区封装原内容件，在meth的反方向。
     *  - 新内容件：简单添加（meth）。
     * meth: prepend|append|fill
     * 注：
     * 片区占优（内容可被封装为片区，反之则不行）。
     * 标题内容的插入方法为填充（fill，下同）。
     *
     * @param  {Element} ael 文章元素
     * @param  {Node|[Node]} h1 主标题内容
     * @param  {[Element]} els 章片区集或内容件集
     * @param  {String} meth 内容插入方法
     * @param  {Boolean} conItem 内容是否为内容件集，可选
     * @return {[Element]} 新插入的片区或内容件集
     */
    Article( ael, [h1, els], meth, conItem ) {
        if ( h1 != null ) {
            blockHeading( 'h1', ael.parentElement, h1, meth );
        }
        if ( conItem == null ) {
            conItem = isConItems(els);
        }
        return sectionContent( ael, els, meth, 'S1', conItem );
    },


    /**
     * 末片区。
     * 主结构：section:s5/conitem...
     * 注：内容只能插入内容件集。
     * @param  {Element} sect 片区容器元素
     * @param  {Node|[Node]} h6 末标题内容
     * @param  {[Element]} els 内容件集
     * @param  {String} meth 内容插入方法
     * @return {[Element|null, [Element]]} 末标题和新插入的内容件集
     */
    S5( sect, [h6, els], meth ) {
        if ( h6 != null ) {
            h6 = sectionHeading( 'h6', sect, h6, meth );
        }
        if ( !isConItems(els) ) {
            throw new Error('the content is invalid.');
        }
        return [h6, $[meth]( sect, els )];
    },


    /**
     * 表格结构。
     * @param  {Element} tbl 表格元素
     * @param  {Node|[Node]} cap 表标题内容
     * @param  {[Node|[Node]]} cons 单元格内容集
     * @param  {String} meth 表格行插入方法
     * @return {Collector} 新插入内容的单元格集
     */
    Table( tbl, [cap, cons], meth ) {
        tbl = tableObj( tbl );

        if ( cap != null ) {
            tbl.caption( cap );
        }
        return tableCells(
                tbl,
                meth,
                Math.ceil(cons.length / tbl.cols()),
                'body'
            )
            .fill(cons).end();
    },


    /**
     * 表头结构（tHead）。
     * @param  {Element} thead 表头元素
     * @param  {[Node|[[Node]]]} cons 单元格内容集
     * @param  {String} meth 表格行插入方法
     * @return {Collector} 新插入内容的单元格集
     */
    Thead( thead, cons, meth ) {
        let _tbo = tableObj(
                $.closest(thead, 'table')
            );

        return tableCells(
                _tbo,
                meth,
                Math.ceil(cons.length / _tbo.cols()),
                'head'
            )
            .fill(cons).end();
    },


    /**
     * 表体结构（tBody）。
     * 支持表格内非唯一表体单元。
     * @param  {Element} tbody 表体元素
     * @param  {[Node|[[Node]]]} cons 单元格内容集
     * @param  {String} meth 表格行插入方法
     * @return {Collector} 新插入内容的单元格集
     */
    Tbody( tbody, cons, meth ) {
        let _tbo = tableObj(
                $.closest(tbody, 'table')
            );

        return tableCells(
                _tbo,
                meth,
                Math.ceil(cons.length / _tbo.cols()),
                'body',
                tbodyIndex(_tbo, tbody)
            )
            .fill(cons).end();
    },


    /**
     * 表脚结构（tFoot）。
     * @param  {Element} tfoot 表脚元素
     * @param  {[Node|[[Node]]]} cons 单元格内容集
     * @param  {String} meth 表格行插入方法
     * @return {Collector} 新插入内容的单元格集
     */
    Tfoot( tfoot, cons, meth ) {
        let _tbo = tableObj(
                $.closest(tfoot, 'table')
            );

        return tableCells(
                _tbo,
                meth,
                Math.ceil(cons.length / _tbo.cols()),
                'foot'
            )
            .fill(cons).end()
    },

};



//
// 空元素创建。
// 仅涉及设置元素特性集操作。
// tag == NAME
/////////////////////////////////////////////////
[
    'img',
    'track',
    'source',
]
.forEach(function( tag ) {
    /**
     * @param  {Object} opts 属性配置集
     * @return {Element}
     */
    Content[ tag ] = function( opts ) {
        return create( tag, opts );
    };
});


//
// 内容单元创建。
// 内容：源码（html）或内联单元/集。
// 包含元素特性设置。
/////////////////////////////////////////////////
[
]
.forEach(function( name ) {
    /**
     * @param  {Node|[Node]|String} cons 单元内容
     * @param  {Object} opts 属性配置，可选
     * @return {Element}
     */
    Content[ name ] = function( cons, opts ) {
        let _el = create( name, opts ),
            _fn = typeof cons === 'string' ? 'html' : 'append';

        $[_fn]( _el, cons );

        $.find( '*', _el )
        .forEach( el => setType( el, type(el) ) );

        return _el;
    };
});


//
// 内容单元创建。
// 内容：纯文本（text）或内联单元/集。
// 包含元素特性设置。
// tag == NAME
/////////////////////////////////////////////////
[
    'a',            // cons, {href, target}
    'strong',       // cons
    'em',           // cons
    'q',            // cons, {cite}
    'abbr',         // text, {title}
    'cite',         // cons
    'small',        // cons
    'del',          // cons, {datetime, cite}
    'ins',          // cons, {datetime, cite}
    'sub',          // cons
    'sup',          // cons
    'mark',         // cons
    'dfn',          // cons, {title}
    'samp',         // cons
    'kbd',          // text
    's',            // cons
    'u',            // cons
    'var',          // text
    'bdo',          // cons, {dir}
    'rb',           // text
    'rt',           // text
    'rp',           // text
    'p',            // cons
    'pre',          // cons
    'address',      // cons
    'h1',           // cons
    'h2',           // cons
    'h3',           // cons
    'h4',           // cons
    'h5',           // cons
    'h6',           // cons
    'summary',      // cons
    'figcaption',   // cons
    'caption',      // cons
    'li',           // cons, {value:Number} // 当前起始编号
    'dt',           // cons
    'dd',           // cons
    'th',           // cons // 暂不支持任何属性设置
    'td',           // cons // 同上
]
.forEach(function( name ) {
    /**
     * 字符串实参优化为数组。
     * @param {Node|[Node]|String} cons 内容（集）
     * @param {Object} opts 属性配置，可选
     */
    Content[ name ] = function( cons, opts ) {
        if ( typeof cons === 'string' ) {
            cons = [cons];
        }
        let _el = create( name, opts );

        return $.append( _el, cons ), _el;
    };
});


//
// 定制内容元素创建。
// 内容：纯文本或内联节点（集）。
// [ role, tag ]
/////////////////////////////////////////////////
[
    [ 'explain',    'span' ],
    [ 'orz',        'code' ],
    [ 'note',       'p' ],
    [ 'tips',       'p' ],
]
.forEach(function( names ) {
    /**
     * 字符串实参优化为数组。
     * @param {Node|[Node]|String} cons 内容（集）
     */
    Content[ names[0] ] = function( cons ) {
        if ( typeof cons === 'string' ) {
            cons = [cons];
        }
        let _el = create(
                names[1],
                null,
                names[0].toUpperCase()
            );
        $.append( _el, cons );

        return $.attr( _el, 'role', names[0] );
    };
});


//
// 定制结构元素创建。
// 内容：结构子元素（非源码或文本）。
// [ role, tag ]
/////////////////////////////////////////////////
[
    [ 'abstract',   'header' ],     // header/h3, p...
    [ 'toc',        'nav' ],        // nav/h3, ol:cascade/li/h4, ol
    [ 'seealso',    'ol' ],         // ul/li/#text
    [ 'reference',  'ul' ],         // ol/li/#text
    [ 's1',         'section' ],    // section/h2, header?, s2 | {content}, footer?
    [ 's2',         'section' ],    // section/h2, header?, s3 | {content}, footer?
    [ 's3',         'section' ],    // section/h2, header?, s4 | {content}, footer?
    [ 's4',         'section' ],    // section/h2, header?, s5 | {content}, footer?
    [ 's5',         'section' ],    // section/h2, header?, {content}, footer?
    [ 'codelist',   'ol' ],         // ol/li/code
    [ 'ulx',        'ul' ],         // ul/li/h4, ul|ol
    [ 'olx',        'ol' ],         // ol/li/h4, ol|ul
    [ 'cascade',    'ol' ],         // ol/li/h4, ol
    [ 'codeblock',  'pre' ],        // pre/code
    [ 'blank',      'div' ],        // div
    [ 'space',      'span' ],       // span
]
.forEach(function( names ) {
    /**
     * @param  {...Element} nodes 子元素序列
     * @return {Element}
     */
    Content[ names[0] ] = function( ...nodes ) {
        let _box = create(
                names[1],
                null,
                names[0].toUpperCase()
            );
        if ( nodes.length ) {
            $.append( _box, nodes );
        }
        return $.attr( _box, 'role', names[0] );
    };
});


//
// 中间定制结构元素创建。
// 内容：结构子元素（非源码或文本）。
// [ NAME, tag ]
/////////////////////////////////////////////////
[
    [ 'codeli',      'li' ],  // li/code
    [ 'ali',         'li' ],  // li/a
    [ 'ah4li',       'li' ],  // li/h4/a
    [ 'ah4',         'h4' ],  // h4/a
    [ 'ulxh4li',     'li' ],  // li/h4, ul|ol
    [ 'olxh4li',     'li' ],  // li/h4, ol|ul
    [ 'cascadeh4li', 'li' ],  // li/h4, ol
    [ 'figimgp',     'p' ],   // p/img, span
]
.forEach(function( names ) {
    /**
     * @param  {...Element} nodes 子元素序列
     * @return {Element}
     */
    Content[ names[0] ] = function( ...nodes ) {
        let _box = create(
                names[1],
                null,
                names[0].toUpperCase()
            );
        return $.append( _box, nodes ), _box;
    };
});


//
// 结构单元创建。
// 内容：结构子元素。
// tag == NAME
/////////////////////////////////////////////////
[
    'header',       // h3, p...
    'footer',       // h3, p...
    'article',      // header?, s1 | {content}, footer?, hr?
    'ul',           // li...
    'ol',           // li...
    'dl',           // dt, dd...
    'figure',       // figcaption, p/img, span:explain
    'blockquote',   // h3, p...
    'aside',        // h3, p...
    'details',      // summary, p...
]
.forEach(function( name ) {
    /**
     * @param  {...Element} nodes 子元素序列
     * @return {Element}
     */
    Content[ name ] = function( ...nodes ) {
        let _box = create( name );
        return $.append( _box, nodes ), _box;
    };
});






//
// 片区（heading, section/）。
// 内容传递 null 表示忽略（不改变）。
/////////////////////////////////////////////////
[
    ['S1', 'h2', 'S2'],
    ['S2', 'h3', 'S3'],
    ['S3', 'h4', 'S4'],
    ['S4', 'h5', 'S5'],
]
.forEach(function( its ) {
    /**
     * @param  {Element} sect 章容器元素
     * @param  {Node|[Node]} h2 章标题内容（兼容空串）
     * @param  {[Element]} els 子片区集或内容件集
     * @param  {String} meth 内容插入方法
     * @param  {Boolean} conItem 内容是否为内容件集，可选
     * @return {[Element|null, [Element]]} 章标题和新插入的内容集
     */
    Content[ its[0] ] = function( sect, [hx, els], meth, conItem ) {
        if ( conItem == null ) {
            conItem = isConItems(els);
        }
        if ( hx != null ) {
            hx = sectionHeading( its[1], sect, hx, meth );
        }
        return [hx, sectionContent( sect, els, meth, its[2], conItem )];
    };
});


//
// 标题区块（/heading, content）
// 标题为填充方式，内容支持方法指定：{
//      append|prepend|fill
// }
// 注：方法不可以为 before|after|replace。
// 由外部保证内容单元的合法性。
/////////////////////////////////////////////////
[
    ['Abstract',    'h3'],
    ['Header',      'h4'],
    ['Footer',      'h4'],
    ['Blockquote',  'h4'],
    ['Aside',       'h4'],
    ['Details',     'summary'],
]
.forEach(function( its ) {
    /**
     * 传递标题为null表示忽略。
     * @param  {Element} root 内容根元素
     * @param  {Node|[Node]} hx 标题内容
     * @param  {Element|[Element]} 合法的内容元素（集）
     * @param  {String} meth 内容插入方法
     * @return {[Element|null, [Element]]} 标题项和新插入的内容单元
     */
    Content[ its[0] ] = function( root, [hx, cons], meth ) {
        if ( hx != null ) {
            blockHeading( its[1], root, hx, meth );
        }
        return [ insertBlock(root, cons, meth), cons ];
    };
});


//
// 简单结构容器（一级子单元）。
// 注：由外部（dataTrans）保证内容单元的合法性。
/////////////////////////////////////////////////
[
    // 列表
    'Seealso',
    'Reference',
    'Ul',
    'Ol',
    'Cascade',  // Ali|Cascadeli 项
    'Codelist', // Codeli
    'Dl',       // dt,dd任意混合
]
.forEach(function( name ) {
    /**
     * @param  {Element} box 容器元素
     * @param  {Element|[Element]} 列表项元素（集）
     * @param  {String} meth 插入方法（append|prepend|fill）
     * @return {[Element]} 新插入的列表项元素（集）
     */
    Content[ name ] = function( box, cons, meth ) {
        return cons && $[meth]( box, cons );
    };
});


//
// 简单容器。
// 子内容简单填充，无结构。
// 注：由外部保证内容单元的合法性。
/////////////////////////////////////////////////
[
    // 内容行
    'P',
    'Address',
    'Pre',
    'Li',
    'Dt',
    'Dd',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'Figcaption',
    'Summary',
    'Th',
    'Td',
    'Caption',

    // 内联文本容器
    'Audio',
    'Video',
    'Picture',
    // 'A',  // 内容<a>剥离
    'Strong',
    'Em',
    'Q',
    'Abbr',
    'Cite',
    'Small',
    'Time',
    'Del',
    'Ins',
    'Sub',
    'Sup',
    'Mark',
    'Code',
    'Orz',
    'Dfn',
    'Samp',
    'Kbd',
    'S',
    'U',
    'Var',
    'Bdo',
    'Meter',
    'B',
    'I',
]
.forEach(function( name ) {
    /**
     * @param  {Element} el 容器元素
     * @param  {Node|[Node]} 合法内容节点（集）
     * @param  {String} meth 插入方法（append|prepend|fill）
     * @return {Element} 容器元素自身
     */
    Content[ name ] = function( el, cons, meth ) {
        return cons && $[meth]( el, cons ), el;
    };
});


//
// 代码插入。
// 结构：[pre, li]/code/..b..
// 会简单检查插入内容的根容器（剥除<code>）。
// 注：内联节点是数据最小单元，因此需检查。
/////////////////////////////////////////////////
[
    'Codeblock',
    'Codeli',
]
.forEach(function( name ) {
    /**
     * @param  {Element} box 代码根容器
     * @param  {Node|[Node]|''} codes 代码内容
     * @param  {String} meth 插入方法
     * @return {Element} 代码根容器元素
     */
    Content[ name ] = function( box, codes, meth ) {
        return insertCodes( box, codes, meth ), box;
    };
});


//
// 注音内容。
// <ruby>的子结构，纯文本内容。
/////////////////////////////////////////////////
[
    'Rb',
    'Rp',
    'Rt',
]
.forEach(function( name ) {
    Content[ name ] = function( el, cons, meth ) {
        return cons && $[meth]( el, $.Text(cons) ), el;
    };
});


//
// 空结构。
// 不支持后期（向内）插入内容。
/////////////////////////////////////////////////
[
    'Hr',
    'Space',
    'Track',
    'Source',
    'Meter',
    'Img',
    'Br',
    'Wbr',
    'Blank',
]
.forEach(function( name ) {
    Content[ name ] = root => root;
});



//
// 工具函数
//////////////////////////////////////////////////////////////////////////////


/**
 * 多次调用。
 * 返回多次调用的返回值集。
 * @param  {Number} n 次数
 * @param  {Function} handle 回调函数
 * @param  {...Value} ...rest 回调实参
 * @return {[Value]}
 */
function handleCalls( n, handle, ...rest ) {
    let _buf = [];

    for (let i = 0; i < n; i++) {
        _buf.push( handle(...rest) );
    }
    return _buf;
}


/**
 * 单元格数据封装。
 * 将内容集中的字符串成员封装为子数组（优化）。
 * 适用：Collector节点插入类接口（.fill|.append|...）。
 * @param  {[Node|[Node]|String]} cons 内容集
 * @return {[Node|[Node]|[String]]}
 */
function cellWraps( cons ) {
    return cons.map( d => typeof d == 'string' ? [d] : d );
}


/**
 * 构建目录。
 * 用于初始创建，不牵涉复制粘贴的逻辑。
 * label可能是一个链接元素，指向主标题（注：不在此构建链接）。
 * @param  {Element} article 文章元素
 * @param  {String|Node|[Node]} label 目录标题（h3/...）
 * @return {Element} 目录元素（nav:toc/...）
 */
function createToc( article, label ) {
    let _top = create( 'nav', {role: 'toc'}, 'TOC' ),
        _lab = $.append( _top, create('h3') );
}


/**
 * 构造标题ID标识。
 * - 简单的剔除源文本中的特殊字符。
 * - 源文本中的空白转换为短横线。
 * @param  {String} text 源文本
 * @return {String} 标识串
 */
function headingID( text ) {
    //
}





/**
 * 创建单个元素。
 * 支持角色（role）在标签冒号之后配置。
 * 注：表格元素需要后续参数 rest: {
 * - rows {Number} 行数
 * - cols {Number} 列数
 * - caption {String} 表标题
 * - th0 {Boolean} 是否列表头
 * }
 * @return {Element}
 */
function single( tags, ...rest ) {
    if ( tags == 'table' ) {
        return $.table( ...rest ).elem();
    }
    return element( ...tags.split(':') );
}


/**
 * 设置块容器的标题内容。
 * 如果标题不存在会自动创建并插入容器最前端。
 * 传递内容为null会删除标题元素。
 * @param  {String} tag 标题标签名
 * @param  {Element} box 所属块容器元素
 * @param  {Node|[Node]|''} cons 标题内容
 * @param  {String} meth 插入方法（fill|append|prepend）
 * @return {Element|null} 标题元素
 */
function blockHeading( tag, box, cons, meth ) {
    let _hx = $.get( `>${tag}`, box );

    if ( cons === null ) {
        return _hx && $.detach(_hx);
    }
    if ( !_hx ) {
        _hx = $.prepend( box, $.Element(tag) );
    }
    return $[meth]( _hx, cons ), _hx;
}


/**
 * 设置片区的标题内容。
 * 如果标题不存在会自动创建并插入关联片区前端。
 * 注：标题内容兼容空串。
 * @param  {String} tag 标题标签名
 * @param  {Element} sect 关联片区元素
 * @param  {Node|[Node]|''} cons 标题内容
 * @param  {String} meth 插入方法（fill|append|prepend）
 * @return {Element} 标题元素
 */
function sectionHeading( tag, sect, cons, meth ) {
    let _hx = $.prev(sect, tag);

    if ( !_hx ) {
        _hx = $.before( sect, $.Element(tag) );
    }
    return $[meth]( _hx, cons ), _hx;
}


/**
 * 添加片区内容。
 * 内容若为片区，外部保证为合法子片区。
 * 内容若为内容件集，则新建片区封装插入。
 * meth: append|prepend|fill
 * @param  {Element} box 片区容器
 * @param  {[Element]|''} cons 子片区或内容件集
 * @param  {String} meth 添加方法
 * @param  {String} sname 新建片区名
 * @param  {Boolean} conItem 内容是否为内容件集
 * @return {Array2} 新插入的片区（标题,片区容器）
 */
function appendSection( box, cons, meth, sname, conItem ) {
    if ( conItem ) {
        let _sx = create(sname);
        cons = Content[sname]( _sx[1], ['', cons], 'append', true );
    }
    return $[meth]( box, cons );
}


/**
 * 设置片区内容。
 * 内容包含子片区集或内容件集（互斥关系）。
 * 原为片区：
 *  - 新片区：简单添加，外部同级保证。
 *  - 内容件：新建一子片区封装插入。
 * 原为内容件：
 *  - 新片区：新建一子片区封装原内容件先行插入。
 *  - 内容件：简单添加（meth）。
 * meth: prepend|append|fill
 * 注：
 * 片区占优（内容可被封装为片区，反之则不行）。
 *
 * @param  {Element} box 片区容器
 * @param  {[Element]|''} cons 子片区集或内容件集
 * @param  {String} meth 插入方法
 * @param  {String} sname 子片区名
 * @param  {Boolean} conItem 内容是否为内容件集
 * @return {[Element]} 新插入的片区或内容件集
 */
function sectionContent( box, cons, meth, sname, conItem ) {
    let _subs = $.children(box);

    if ( !isConItems(_subs) ) {
        return appendSection( box, cons, meth, sname, conItem );
    }
    if ( !conItem ) {
        appendSection( box, _subs, 'append', sname, true );
    }
    return $[meth]( box, cons );
}


/**
 * 创建目录列表（单层）。
 * @param  {Element} ol 列表容器
 * @param  {Element} sec 片区容器
 * @return {Element} ol
 */
function tocList( ol, sec ) {
    let _its = sec.firstElementChild,
        _sec = _its.nextElementSibling;

    while ( _its ) {
        if ( $.is(_its, __hxSlr) ) {
            $.append( ol, tocItem(_its, _sec) );
        }
        _its = _sec.nextElementSibling;
        _sec = _its.nextElementSibling;
    }
    return ol;
}


/**
 * 创建目录列表项（单个）。
 * 如果片区内包含子片区（非纯内容），会递进处理。
 * @param  {Element} hx 标题元素
 * @param  {Element} sect 相邻片区容器
 * @return {Element} 列表项（<li>）
 */
function tocItem( hx, sect ) {
    let _li = null;

    if ( isConItems($.children(sect)) ) {
        _li = Content.Ali( create('Ali'), $.contents(hx) );
    } else {
        _li = Content.Cascadeli( create('Cascadeli'), $.contents(hx) );
        tocList( _li.lastElementChild, sect );
    }
    return _li;
}


/**
 * 检查剥离节点元素的<code>封装。
 * 注：仅检查顶层容器。
 * @param  {Node} node 目标节点
 * @param  {String} tag 剥离元素标签
 * @return {Node|[Node]}
 */
function stripElem( node, tag ) {
    if ( node.nodeType != 1 ) {
        return node;
    }
    return $.is(node, tag) ? $.contents(node) : node;
}


/**
 * 检查/剥离内容中的链接元素。
 * @param  {Node|[Node]} cons 内容节点（集）
 * @return {Node|[Node]}
 */
function stripLinks( cons ) {
    return $.isArray(cons) ?
        cons.map( el => stripElem(el, 'a') ) :
        stripElem( cons, 'a' );
}


/**
 * 插入代码内容。
 * 固定的<code>友好容错修复。
 * @param  {Element} box 代码容器（<code>父元素）
 * @param  {Node|[Node]|''} codes 代码内容（不含<code>封装）
 * @param  {String} meth 插入方法
 * @return {Node|[Node]} 新插入的节点集
 */
function insertCodes( box, codes, meth ) {
    let _cbox = box.firstElementChild;

    if ( !_cbox ||
        !$.is(_cbox, 'code') ) {
        _cbox = $.wrapInner(box, '<code>');
    }
    if ( codes.nodeType ) {
        codes = stripElem( codes, 'code' );
    } else {
        codes = codes.map( el => stripElem(el, 'code') );
    }
    return $[meth]( _cbox, codes );
}


/**
 * 插入链接内容。
 * 如果容器内不为<a>元素，自动创建封装。
 * @param  {Element} box 链接容器（兼容<a>）
 * @param  {Node|[Node]} cons 链接内容
 * @param  {String} meth 插入方法
 * @return {Node|[Node]} cons
 */
function insertLink( box, cons, meth ) {
    let _a = $.get( '>a', box );

    if ( !_a ) {
        _a = $.wrapInner( box, '<a>' );
    }
    return $[meth]( _a, stripLinks(cons) );
}


/**
 * 列表合并。
 * 源如果是列表容器（ol|ul），只能是单个元素。
 * @param  {Element} to 目标列表
 * @param  {Element|[Element]} src 列表项源（ul|ol|[li]）
 * @param  {String} meth 插入方法
 * @return {[Element]} 新插入的列表项
 */
function listMerge( to, src, meth ) {
    if ( src.nodeType ) {
        src = $.children( src );
    }
    return $[meth]( to, src );
}


/**
 * 小区块内容填充。
 * 指包含标题的小区块单元，内容填充不影响标题本身。
 * 注：标题与内容是同级关系。
 * @param  {Element} root 区块根
 * @param  {Element|[Element]} cons 主体内容集
 * @param  {String} meth 插入方法（prepend|append|fill）
 * @return {Element|null} 标题元素
 */
function insertBlock( root, cons, meth ) {
    let _hx = $.detach(
            $.get(__hxBlock)
        );
    $[meth]( root, cons );

    return _hx && $.prepend( root, _hx );
}


/**
 * 插入方法对应的位置值。
 * @param  {String} meth 方法名
 * @return {Number}
 */
function tableWhere( meth ) {
    switch (meth) {
        case 'append': return -1;
        case 'prepend': return 0;
    }
    return null;
}


/**
 * 获取表格区实例。
 * @param  {Table} tbl 表格实例
 * @param  {String} name 表格区名称（body|head|foot）
 * @param  {Number} bi tBody元素序号，可选
 * @return {TableSection|null}
 */
function tableSection( tbl, name, bi = 0 ) {
    switch (name) {
        case 'head': return tbl.head();
        case 'foot': return tbl.foot();
        case 'body': return tbl.body()[bi];
    }
    return null;
}


/**
 * 获取表格单元格集。
 * 根据插入方法返回新建或清空的单元格集。
 * meth为填充时会清空rows行的单元格。
 * @param  {Table} tbl 表格实例（$.Table）
 * @param  {String} meth 插入方法
 * @param  {Number} rows 插入行数，可选
 * @param  {String} name 表格区名称（body|head|foot），可选
 * @param  {Number} bi tBody元素序号，可选
 * @return {Collector|null} 单元格集
 */
function tableCells( tbl, meth, rows, name, bi ) {
    let _tsec = tableSection(tbl, name, bi);

    if ( !_tsec && name ) {
        return null;
    }
    if ( meth == 'fill' ) {
        return tbl.gets(0, rows, _tsec).find('th,td').flat().empty().end();
    }
    return tbl[name](tableWhere(meth), rows, _tsec).find('th,td').flat();
}


/**
 * 获取表体元素序号。
 * 约束：实参表体必须在实参表格元素之内。
 * @param  {Table} tbo 表格实例
 * @param  {Element} tbody 表体元素
 * @return {Number}
 */
function tbodyIndex( tbo, tbody ) {
    let _bs = tbo.body();
    return _bs.length == 1 ? 0 : _bs.indexOf(tbody);
}


/**
 * 变通表格行插入方法。
 * meth: before|after|prepend|append
 * @param  {String} meth 方法名
 * @return {String}
 */
function trMeth( meth ) {
    switch (meth) {
        case 'prepend':
            return 'before';
        case 'append':
            return 'after';
    }
    return __trMeths.include(meth) && meth;
}


/**
 * 克隆表格行。
 * 包含表格行上注册的事件处理器。
 * @param  {Element} tr 表格行
 * @param  {Number} rows 目标行数
 * @param  {Boolean} clean 是否清除内容
 * @return {[Element]} 表格行集
 */
function trClone( tr, rows, clean ) {
    let _new = $.clone(tr, true),
        _buf = [_new];

    if ( clean ) {
        $(_new.cells).empty();
    }
    for (let i = 0; i < rows-1; i++) {
        _buf.push( $.clone(_new, true) );
    }
    return _buf;
}


/**
 * 注音内容构造。
 * obj: {
 *      rb:  String
 *      rtp: [rp,rt,rp:String]
 * }
 * @param  {Object} obj 注音内容配置
 * @return {[Element]} 内容节点集
 */
function rubySubs( obj ) {
    return [
        $.Element('rb', obj.rb),
        obj.rtp[0] && $.Element('rp', obj.rtp[0]),
        $.Element('rt', obj.rtp[1]),
        obj.rtp[2] && $.Element('rp', obj.rtp[2]),
    ];
}


//
// 扩展&导出。
//////////////////////////////////////////////////////////////////////////////


//
// By扩展：
// New.[cell-name](...)
//
extend( 'New', Content );


export { create };
