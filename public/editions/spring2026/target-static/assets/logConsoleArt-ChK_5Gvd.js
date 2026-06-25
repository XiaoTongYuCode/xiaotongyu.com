import{_ as f}from"./preload-helper-Bc6gya-x.js";const r=560,g=300,_=-135,i="rotateX(18deg) rotateY(-295deg)",s="animation:spring-2026-console-art-spin 120s linear infinite",u="color: #1a1a1a; color: CanvasText;",S="Shopify Editions | Spring ’26",O=`███████╗██╗   ██╗███████╗██████╗ ██╗   ██╗██╗    ██╗██╗  ██╗███████╗██████╗ ███████╗
██╔════╝██║   ██║██╔════╝██╔══██╗╚██╗ ██╔╝██║    ██║██║  ██║██╔════╝██╔══██╗██╔════╝
█████╗  ██║   ██║█████╗  ██████╔╝ ╚████╔╝ ██║ █╗ ██║███████║█████╗  ██████╔╝█████╗  
██╔══╝  ╚██╗ ██╔╝██╔══╝  ██╔══██╗  ╚██╔╝  ██║███╗██║██╔══██║██╔══╝  ██╔══██╗██╔══╝  
███████╗ ╚████╔╝ ███████╗██║  ██║   ██║   ╚███╔███╔╝██║  ██║███████╗██║  ██║███████╗
╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝   ╚═╝    ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝`;let c=!1;function m(o){const e=encodeURIComponent(o).replace(/%([0-9A-F]{2})/g,(n,t)=>String.fromCharCode(parseInt(t,16)));return`data:image/svg+xml;base64,${btoa(e)}`}function A(o,e){const n=e?`transform:${i}`:`transform:${i};${s}`;return o.replace("<style>","<style>:root{color-scheme:light dark}").replace("color:#000;",u).replace(s,n)}async function T(o){var a;if(c||typeof window>"u")return;c=!0;const e=(o==null?void 0:o.trim())||S,n=((a=window.matchMedia)==null?void 0:a.call(window,"(prefers-reduced-motion: reduce)").matches)===!0,t=window.navigator.userAgent.toLowerCase();if(t.includes("safari")&&!t.includes("chrome"))console.log(`%c${O}`,"font-family: monospace; font-size: 11px; line-height: 1;");else{const{default:l}=await f(async()=>{const{default:p}=await import("./heroRingConsole-CD3Du-H2.js");return{default:p}},[]),d=m(A(l,n));console.log("%c ",`
      color: transparent;
      display: inline-block;
      font-size: 1px;
      line-height: 0;
      padding: 0 0 ${g}px ${r}px;
      background-image: url(${d});
      background-position: left ${_}px;
      background-repeat: no-repeat;
      background-size: ${r}px ${r}px;
      `)}console.log("%c%s","font-family: monospace; font-size: 16px;",e)}export{T as logConsoleArt};
//# sourceMappingURL=logConsoleArt-ChK_5Gvd.js.map
