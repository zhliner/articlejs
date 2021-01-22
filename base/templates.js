//! $Id: templates.js 2020.05.09 Articlejs.Config $
// ++++++++++++++++++++++++++++++++++++++++++++++++++
//  Project: Articlejs v0.1.0
//  E-Mail:  zhliner@gmail.com
//  Copyright (c) 2019 - 2020 铁皮工作室  MIT License
//
//////////////////////////////////////////////////////////////////////////////
//
//  模板配置集。
//
//  主面板：新建插入类型条目的模板名映射，<option>条目。
//  模态框：可编辑属性的单元的属性编辑模板名映射，<li>条目。
//
//
///////////////////////////////////////////////////////////////////////////////
//

import * as T from "./types.js";


//
// 插入条目：{
//      单元值：模板名
// }
// 普通模式下待插入条目的 选单/模板名 映射。
//////////////////////////////////////////////////////////////////////////////
// 注记：
// <option value="[录入模板名]">[条目名]</option>
// 用户单击选单，OBT提取录入模板并在录入区显示，供用户录入内容。
//
const InputOptions = {
    // 内容元素向内插入时可用条目。
    [ T.$TEXT ]:        'option:text',

    [ T.AUDIO ]:        'option:audio',
    [ T.VIDEO ]:        'option:video',
    [ T.PICTURE ]:      'option:picture',
    [ T.SVG ]:          'option:svg',
    [ T.RUBY ]:         'option:ruby',
    [ T.METER ]:        'option:meter',
    [ T.SPACE ]:        'option:space',
    [ T.IMG ]:          'option:img',
    [ T.BR ]:           'option:br',
    [ T.WBR ]:          'option:wbr',

    [ T.TRACK ]:        'option:track',
    [ T.SOURCE ]:       'option:source',
    [ T.EXPLAIN ]:      'option:explain',
    // <ruby>子单元。
    [ T.RBPT ]:         'option:rbpt',
    [ T.RB ]:           'option:rb',  // 更新模式
    [ T.RT ]:           'option:rt',  // 更新模式
    // <svg>向内插入时可用条目。
    // <svg>子元素平级和向内插入时可用条目。
    [ T.SVGITEM ]:      'option:svgitem',

    [ T.A ]:            'option:a',
    [ T.Q ]:            'option:q',
    [ T.ABBR ]:         'option:abbr',
    [ T.DEL ]:          'option:del',
    [ T.INS ]:          'option:ins',
    [ T.DFN ]:          'option:dfn',
    [ T.BDO ]:          'option:bdo',
    [ T.TIME ]:         'option:times',
    [ T.CODE ]:         'option:code',
    [ T.STRONG ]:       'option:strong',
    [ T.EM ]:           'option:em',
    [ T.CITE ]:         'option:cite',
    [ T.SMALL ]:        'option:small',
    [ T.SUB ]:          'option:sub',
    [ T.SUP ]:          'option:sup',
    [ T.MARK ]:         'option:mark',
    [ T.ORZ ]:          'option:orz',
    [ T.SAMP ]:         'option:samp',
    [ T.KBD ]:          'option:kbd',
    [ T.S ]:            'option:s',
    [ T.U ]:            'option:u',
    [ T.VAR ]:          'option:var',
    // 不支持单独创建
    // [ T.B ]:         null,
    // [ T.I ]:         null,

    [ T.P ]:            'option:p',
    [ T.NOTE ]:         'option:note',
    [ T.TIPS ]:         'option:tips',
    [ T.PRE ]:          'option:pre',
    [ T.ADDRESS ]:      'option:address',

    [ T.H1 ]:           'option:h1',
    [ T.H2 ]:           'option:h2',
    [ T.H3 ]:           'option:h3',
    [ T.H4 ]:           'option:h4',
    [ T.H5 ]:           'option:h5',
    [ T.H6 ]:           'option:h6',
    [ T.SUMMARY ]:      'option:summary',
    [ T.FIGCAPTION ]:   'option:figcaption',
    [ T.CAPTION ]:      'option:caption',
    [ T.LI ]:           'option:li',
    [ T.DT ]:           'option:dt',
    [ T.DD ]:           'option:dd',
    [ T.TH ]:           'option:th',
    [ T.TD ]:           'option:td',
    [ T.TR ]:           'option:tr',
    [ T.THEAD ]:        'option:thead',
    [ T.TBODY ]:        'option:tbody',
    [ T.TFOOT ]:        'option:tfoot',

    [ T.CODELI ]:       'option:codeli',
    [ T.ALI ]:          'option:ali',
    [ T.AH4 ]:          'option:ah4',
    [ T.XH4LI ]:        'option:xh4li',
    [ T.CASCADEH4LI ]:  'option:cascadeh4li',
    [ T.CASCADEAH4LI ]: 'option:cascadeah4li',
    [ T.FIGIMGBOX ]:    'option:figimgbox',

    [ T.HGROUP ]:       'option:hgroup',
    [ T.ARTICLE ]:      'option:article',
    [ T.S1 ]:           'option:s1',
    [ T.S2 ]:           'option:s2',
    [ T.S3 ]:           'option:s3',
    [ T.S4 ]:           'option:s4',
    [ T.S5 ]:           'option:s5',
    [ T.ABSTRACT ]:     'option:abstract',
    [ T.SEEALSO ]:      'option:seealso',
    [ T.REFERENCE ]:    'option:reference',
    [ T.HEADER ]:       'option:header',
    [ T.FOOTER ]:       'option:footer',
    [ T.SECTION ]:      'option:section',
    [ T.UL ]:           'option:ul',
    [ T.OL ]:           'option:ol',
    [ T.CODELIST ]:     'option:codelist',
    [ T.ULX ]:          'option:ulx',
    [ T.OLX ]:          'option:olx',
    [ T.CASCADE ]:      'option:cascade',
    [ T.DL ]:           'option:dl',
    [ T.TABLE ]:        'option:table',
    [ T.FIGURE ]:       'option:figure',
    [ T.BLOCKQUOTE ]:   'option:blockquote',
    [ T.ASIDE ]:        'option:aside',
    [ T.DETAILS ]:      'option:details',
    [ T.CODEBLOCK ]:    'option:codeblock',

    [ T.HR ]:           'option:hr',
    [ T.BLANK ]:        'option:blank',
};



//
// 单元属性：{
//      单元值：模板名,
// }
// 即上下文菜单中“属性”条目匹配的模板。
// 仅针对常见单元的常见属性，其它属性可通过特性面板直接编辑（attribute）。
//////////////////////////////////////////////////////////////////////////////
// 注记：选取集单元必须相同，才能调出属性编辑框。
//
const Properties = {
    [ T.AUDIO ]:        'property:audio',       // src, autoplay, loop, controls, sources
    [ T.VIDEO ]:        'property:video',       // src, width, height, autoplay, loop, controls, poster, sources
    [ T.IMG ]:          'property:picture',     // src, width, height, alt, sources
    [ T.IMG ]:          'property:img',         // src, width, height, alt
    [ T.SVG ]:          'property:svg',         // width, height
    [ T.RUBY ]:         'property:ruby',        // rb, rt, rp
    [ T.TIME ]:         'property:times',       // datetime: date, time
    [ T.METER ]:        'property:meter',       // max, min, high, low, value, optimum
    [ T.SPACE ]:        'property:space',       // width
    [ T.A ]:            'property:a',           // href, target
    [ T.Q ]:            'property:q',           // cite
    [ T.ABBR ]:         'property:abbr',        // title
    [ T.DEL ]:          'property:del',         // datetime: date, time
    [ T.INS ]:          'property:ins',         // datetime: date, time
    [ T.CODE ]:         'property:code',        // data-lang, data-tab
    [ T.DFN ]:          'property:dfn',         // title
    [ T.BDO ]:          'property:bdo',         // dir
    [ T.BLOCKQUOTE ]:   'property:blockquote',  // cite
    [ T.CODELIST ]:     'property:codelist',    // data-lang, data-tab, start
    [ T.OL ]:           'property:ol',          // start, type, reversed
    [ T.OLX ]:          'property:olx',         // start, type, reversed
    [ T.LI ]:           'property:li',          // start
    [ T.CODELI ]:       'property:li',          // start
    [ T.ALI ]:          'property:li',          // start
    [ T.XH4LI ]:        'property:li',          // start
    [ T.CASCADEH4LI ]:  'property:li',          // start
    [ T.CASCADEAH4LI ]: 'property:li',          // start
    [ T.TABLE ]:        'property:table',       // cols, rows, border, th0
    [ T.HR ]:           'property:hr',          // thick, length, space, border
    [ T.BLANK ]:        'property:blank',       // width, height
    [ T.EXPLAIN ]:      'property:explain',     // position
    [ T.H1 ]:           'property:h1',          // id
    [ T.H2 ]:           'property:h2',          // id
    [ T.H3 ]:           'property:h3',          // id
    [ T.H4 ]:           'property:h4',          // id
    [ T.H5 ]:           'property:h5',          // id
    [ T.H6 ]:           'property:h6',          // id
};


//
// 不可平级自由插入类型。
// 注记：
// <main>不应当被选取，此处仅表达一种逻辑（冗余）。
//
const siblingNone = new Set( [T.RB, T.RT, T.RP, T.MAIN] );



//
// 导出
//////////////////////////////////////////////////////////////////////////////


/**
 * 获取向内插入条目集。
 * @param  {[Element]} els 目标元素集
 * @return {[String]} 模板名集
 */
export function options( els ) {
    let _ref = els.shift();
    if ( !_ref ) {
        return [];
    }
    let _subs = [...T.childTypes(_ref)];

    if ( els.length > 0 ) {
        _subs = _subs.filter(
            tv => els.every( box => T.isChildType(box, tv) )
        );
    }
    return $.map( _subs.filter(tv => !siblingNone.has(tv)), tv => InputOptions[tv] );
}


/**
 * 获取可编辑属性模板名。
 * @param  {Number} tval 目标元素类型值
 * @return {String|null}
 */
export function property( tval ) {
    return Properties[ tval ] || null;
}
