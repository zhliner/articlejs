const t=window.$;class e{constructor(t){this._base=t,this._pool=new Map}json(t){return this._load(this.url(t),"json")}text(t){return this._load(this.url(t),"text")}node(t){return this._load(this.url(t),"text",!0)}blob(t){return this._load(this.url(t),"blob")}formData(t){return this._load(this.url(t),"formData")}arrayBuffer(t){return this._load(this.url(t),"arrayBuffer")}base(){return new URL("",this._base).href}clear(){this._pool.clear()}clean(t){return this._pool.delete(this.url(t).href)}url(t){return"string"==typeof t?new URL(t,this._base):t}_load(t,e,r){let s=this._pool.get(t.href);return s||(s=this._fetch(t,e,r),this._pool.set(t.href,s),window.console.log(`loading for "${t}"`)),s}_fetch(e,r,s){let o=fetch(e).then((t=>t.ok?t[r]():Promise.reject(t.statusText)));return s?o.then((e=>t.fragment(e))):o}}class r{constructor(t,e){this._loader=e,t&&!t.endsWith("/")&&(t+="/"),this._path=e.base()+t,this._fmap=new Map,this._tmap=new Map}config(e){return"Object"==t.type(e)?Promise.resolve(this._config(e)):this._loader.json(this.url(e)).then((t=>this._config(t)))}load(t){let e=this._tmap.get(t);return e?this._loader.node(this.url(e)).then((t=>[t,e])):Promise.reject(`err: [${t}] not in any file.`)}json(t){return this._loader.json(this.url(t))}names(){return[...this._tmap.keys()]}clear(){this._tmap.clear(),this._fmap.clear()}clean(t){let e=this._fmap.get(t);e&&e.forEach((t=>this._tmap.delete(t))),this._fmap.delete(t),this._loader.clean(this.url(t))}url(t){return"string"==typeof t?new URL(t,this._path):t}_config(t){for(const[e,r]of Object.entries(t))r.forEach((t=>this._tmap.set(t,e))),this._fmap.set(e,r);return this._tmap}}export{e as Loader,r as TplLoader};
//# sourceMappingURL=tloader.js.map