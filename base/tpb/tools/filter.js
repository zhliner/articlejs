import{format as t}from"./date.js";
//! $ID: filter.js 2019.09.17 Tpb.Tools $
const e=window.$,o={cut(t,e,o=".."){let n=[];for(let o of t){if((e-=r(o))<0)break;n.push(o)}return e<0?function(t,e){let o=(n=e,[...n].reduce(((t,e)=>t+r(e)),0));var n;for(let e=t.length-1;e>=0&&(o-=r(t[e]),!(o<0));e--)t.pop();return t.join("")+e}(n,o):n.join("")},text:t=>e.text(t),html:t=>e.html(t),date:(e,o)=>t(e,o),trim:t=>t.trim(),clean:t=>t.trim().replace(/\s+/g," "),node:(t,o)=>o?e.Element(o,t):e.Text(t)};["strong","em","q","abbr","cite","small","time","del","ins","sub","sup","mark","code","dfn","samp","kbd","s","u","var","bdo","b","i"].forEach((function(t){o[t]=o=>e.Element(t,o)}));const r=t=>t.codePointAt()<255?1:2;export{o as Filter};
//# sourceMappingURL=filter.js.map
