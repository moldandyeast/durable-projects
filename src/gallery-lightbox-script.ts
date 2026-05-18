/**
 * Gallery lightbox runtime — served at GET /gallery-lightbox.js so public HTML CSP can use
 * script-src 'self' without 'unsafe-inline' (markdown cannot inject runnable scripts).
 */
export const GALLERY_LIGHTBOX_JS = `(function(){
  var strip=document.querySelector("[data-gallery-strip]");
  var dlg=document.getElementById("gallery-lightbox");
  if(!strip||!dlg||typeof dlg.showModal!=="function")return;
  var imgEl=dlg.querySelector(".gallery-lightbox__img");
  var capEl=dlg.querySelector(".gallery-lightbox__caption");
  var prevBtn=dlg.querySelector("[data-gallery-prev]");
  var nextBtn=dlg.querySelector("[data-gallery-next]");
  if(!imgEl||!capEl)return;
  var thumbs=[].slice.call(strip.querySelectorAll(".gallery-thumb"));
  var idx=0;
  function apply(i){
    if(!thumbs.length)return;
    idx=(i+thumbs.length)%thumbs.length;
    var b=thumbs[idx];
    imgEl.src=b.getAttribute("data-gallery-src")||"";
    imgEl.alt=b.getAttribute("data-gallery-alt")||"";
    var c=b.getAttribute("data-gallery-caption")||"";
    capEl.textContent=c;
    var multi=thumbs.length>1;
    if(prevBtn)prevBtn.hidden=!multi;
    if(nextBtn)nextBtn.hidden=!multi;
  }
  strip.addEventListener("click",function(ev){
    var btn=ev.target.closest(".gallery-thumb");
    if(!btn)return;
    var j=thumbs.indexOf(btn);
    if(j<0)return;
    apply(j);
    dlg.showModal();
  });
  dlg.addEventListener("click",function(ev){
    if(ev.target===dlg)dlg.close();
    if(ev.target.closest("[data-gallery-close]"))dlg.close();
    if(ev.target.closest("[data-gallery-prev]")){ev.preventDefault();apply(idx-1);}
    if(ev.target.closest("[data-gallery-next]")){ev.preventDefault();apply(idx+1);}
  });
  dlg.addEventListener("keydown",function(ev){
    if(!dlg.open)return;
    if(ev.key==="ArrowRight"){ev.preventDefault();apply(idx+1);}
    if(ev.key==="ArrowLeft"){ev.preventDefault();apply(idx-1);}
  });
})();`;
