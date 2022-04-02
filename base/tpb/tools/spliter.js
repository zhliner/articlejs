//! $ID: spliter.js 2019.08.19 Tpb.Tools $
class t{constructor(){this._qch="",this._esc=!1}umpire(t){return'"'==t||"'"==t||"`"==t?this._quote(t):(this._escape(t),!!this._qch)}reset(){this._qch="",this._esc=!1}ready(){return""===this._qch&&!this._esc}_quote(t){return this._esc||(""==this._qch?this._qch=t:this._qch==t&&(this._qch="")),!0}_escape(t){if(!this._qch||"\\"!==t)return this._esc=!1;"\\"===t&&(this._esc=!this._esc)}}class s{constructor(){this._cnt=0}umpire(t){return"("===t?!!(this._cnt+=1):")"===t?!(this._cnt-=1):!!this._cnt}reset(){this._cnt=0}ready(){return 0===this._cnt}}class e{constructor(t,s){this._ch1=t,this._ch2=s,this._cnt=0}umpire(t){return t===this._ch1?!!(this._cnt+=1):t===this._ch2?!(this._cnt-=1):!!this._cnt}reset(){this._cnt=0}ready(){return 0===this._cnt}}class i{constructor(t,...s){this._sep=t,this._umps=s}*split(t="",s=1/0){let e="",i=t.endsWith(this._sep);for(;t&&s--;)[e,t]=this._pair(t,this._sep),yield e;(t||i)&&(yield t)}*part(t="",s=1/0){let e="",i="",r=!1;for(;t&&s--;)[e,i,t,r]=this._part(t,i,r),yield e;i&&(yield i)}reset(){return this._umps.forEach((t=>t.reset())),this}ready(){return this._umps.every((t=>t.ready()))}_pair(t,s){let e=0;for(let i of t){if(!this._inside(i)&&i===s)break;e+=i.length}return[t.substring(0,e),t.substring(e+s.length)]}_part(t,s,e){let i="",r=0,h=e;for(let s of t){if(i=s,h!=(e=this._inside(s)))break;r+=s.length}return h==e&&(i=""),[s+t.substring(0,r),i,t.substring(r+i.length),e]}_inside(t){return this._umps.some((s=>s.umpire(t)))}}export{i as Spliter,s as UmpCaller,e as UmpChars,t as UmpString};
//# sourceMappingURL=spliter.js.map