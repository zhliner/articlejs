import{Render as t}from"./render.js";const e=window.$,s="on",l="by",r="to",i="obt-src",n=`[${s}], [${i}]`;class o{constructor(t,e,s){this._obter=t,this._loader=e,this._tpls=s||new Map,this._tplx=new Map,this._pool=new Map}get(t){let e=this._tpls.get(t);return e?Promise.resolve(e):this._tplx.get(t)||this._load(t)}clone(t,e){return this.get(t).then((t=>this._clone(t,e)))}node(t,e,s){let l=this._tpls.get(t);return l?e?this._clone(l,s):l:null}del(t){let e=this._tpls.get(t);return e&&this._tpls.delete(t),e||null}clear(){this._tpls.clear()}build(t,e){return this._build(t,e).then((()=>this))}tpls(t){for(const s of e.find("[tpl-name]",t,!0))this.add(s),e.trigger(s,"tpled",null,!1,!1);let s=this._subs(t);return s?Promise.all(s):Promise.resolve()}add(t){let s=e.xattr(t,"tpl-name"),l=this._subs(t);if(!l)return this._add(s,t);let r=Promise.all(l).then((()=>this._add(s,t))).then((()=>this._tplx.delete(s)&&t));this._tplx.set(s,r)}config(t){return this._loader.config(t||{}).then((()=>this))}_build(e,s=!1){if(this._pool.has(e))return this._pool.get(e);let l=this._buildx(e).then((()=>this.tpls(e))).then((()=>this._pool.delete(e))).then((()=>s&&!this._loader.clean(s)));return this._pool.set(e,l),t.parse(e)&&l}_add(t,e){if(this._tpls.has(t))throw new Error(`[${t}] node was exist.`);this._tpls.set(t,e)}_load(t){return this._loader.load(t).then((([t,e])=>this._build(t,e))).then((()=>this._tpls.get(t)||this._tplx.get(t)))}_clone(s,l){return t.clone(s,e.clone(s,l,!0,l))}_subs(t){let s=e.find("[tpl-node], [tpl-source]",t,!0);return 0===s.length?null:e.map(s,(t=>this._imports(t)))}_pick(t){return this.get(t).then((e=>(this._tpls.delete(t)||this._tplx.delete(t))&&e))}_imports(t){let[s,l]=this._reference(t),r=!1;return"!"===l[0]&&(r=!0,l=l.substring(1)),Promise.all(l.split(",").map((t=>this[s](t.trim(),r)))).then((s=>e.replace(t,s)))}_reference(t){let s=t.hasAttribute("tpl-node")?"tpl-node":"tpl-source",l=e.xattr(t,s).trim(),r="get";return"~"===l[0]&&(r="_pick",l=l.substring(1)),["tpl-node"==s?"clone":r,l]}_buildx(t){let s=[];for(const l of e.find(n,t,!0))s.push(p(l,this._loader).then((t=>t.forEach((t=>this._obter.build(l,t))))));return Promise.all(s)}}const h=`${s} ${l} ${r} ${i}`;function p(t,n){let o=[];return t.hasAttribute(s)&&o.push(function(t){return{on:e.attr(t,s)||"",by:e.attr(t,l)||"",to:e.attr(t,r)||""}}(t)),t.hasAttribute(i)&&o.push(...function(t,e){return t.split(",").map((t=>e.json(t.trim())))}(e.attr(t,i),n)),e.removeAttr(t,h),Promise.all(o).then((t=>t.flat()))}export{o as Templater,p as obtAttr};
//# sourceMappingURL=templater.js.map