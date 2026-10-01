/* js/main.js — navegación móvil, lightbox, tabs, vídeos, reveals */
(function(){
"use strict";
var $=function(s,c){return (c||document).querySelector(s)};
var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};

/* año del pie */
$$(".js-year").forEach(function(el){el.textContent=new Date().getFullYear()});

/* menú móvil */
var toggle=$(".nav-toggle"),nav=$("#nav-principal");
if(toggle){
  toggle.addEventListener("click",function(){
    var open=document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded",open?"true":"false");
    toggle.setAttribute("aria-label",open?"Cerrar menú":"Abrir menú");
  });
  $$(".site-nav a").forEach(function(a){a.addEventListener("click",function(){
    document.body.classList.remove("nav-open");toggle.setAttribute("aria-expanded","false");
  })});
  document.addEventListener("keydown",function(e){
    if(e.key==="Escape")document.body.classList.remove("nav-open");
  });
}

/* load more progresivo (home y book, solo m\u00f3vil) */
$$("[data-loadmore]").forEach(function(btn){
  btn.addEventListener("click",function(){
    var t=document.querySelector(btn.getAttribute("data-loadmore"));
    if(t)t.classList.add("expanded");
    var w=btn.closest(".loadmore-wrap");if(w)w.hidden=true;
  });
});

/* reveals */
if("IntersectionObserver" in window){
  var io=new IntersectionObserver(function(es){
    es.forEach(function(en){if(en.isIntersecting){en.target.classList.add("in");io.unobserve(en.target)}});
  },{threshold:.08});
  $$(".reveal").forEach(function(el){io.observe(el)});
}else{$$(".reveal").forEach(function(el){el.classList.add("in")})}

/* volver arriba */
var toTop=$(".to-top");
if(toTop){toTop.addEventListener("click",function(){window.scrollTo({top:0,behavior:"smooth"})})}

/* ---------- lightbox ---------- */
var lb=$(".lightbox");
if(lb){
  var lbImg=$("img",lb),lbTitle=$(".lb-title",lb),lbCred=$(".lb-credits",lb);
  /* --- navegación reutilizable, agnóstica al modo de vista (punto 3.4) ---
     La lista es siempre la de la SECCIÓN clicada (convención worker 3.2:
     contenedores #sec-neutras / #sec-personalidad y data-sec="neutras|personalidad"
     en cada <a data-lightbox>), en el orden del collage (orden DOM).
     Tanto la vista con textos (3.3) como el fullscreen (3.5) navegan con
     lbNext() / lbPrev() / lbShow(i): no dependen del modo de vista. */
  var lbItems=[],lbIdx=0;
  function lbItemsOf(a){
    var sec=a.getAttribute("data-sec"); /* convención worker 3.2 */
    if(!sec){var c=a.closest("#sec-neutras,#sec-personalidad");
      if(c)sec=(c.id==="sec-neutras")?"neutras":"personalidad"}
    return sec?$$("#sec-"+sec+" [data-lightbox]"):$$("[data-lightbox]");
  }
  function lbShow(i){
    lbIdx=(i+lbItems.length)%lbItems.length;
    var a=lbItems[lbIdx];
    lbImg.src=a.getAttribute("data-full");lbImg.alt=a.getAttribute("data-alt")||"";
    lbTitle.textContent=a.getAttribute("data-title")||"";
    lbCred.textContent="";
    (a.getAttribute("data-credits")||"").split("\n").forEach(function(l){
      if(!l)return;
      var p=document.createElement("p");p.textContent=l;lbCred.appendChild(p);
    });
    var pre=new Image();pre.src=lbItems[(lbIdx+1)%lbItems.length].getAttribute("data-full");
  }
  function lbNext(){lbShow(lbIdx+1)}
  function lbPrev(){lbShow(lbIdx-1)}
  function open(a){
    lbItems=lbItemsOf(a); /* lista confinada a la sección clicada (3.4) */
    var i=lbItems.indexOf(a);
    lbShow(i<0?0:i); /* índice inicial = posición del ancla clicada en su sección */
    lb.hidden=false;document.body.style.overflow="hidden";$(".lb-close",lb).focus();
  }
  function close(){if(lbFsActive()){(document.exitFullscreen||document.webkitExitFullscreen).call(document)}lb.hidden=true;document.body.style.overflow="";lbImg.src=""}
  document.addEventListener("click",function(e){
    var a=e.target.closest("[data-lightbox]");
    if(a){e.preventDefault();open(a)}
  });
  $(".lb-close",lb).addEventListener("click",function(){lbInFs()?lbExitFs():close()});
  $(".lb-prev",lb).addEventListener("click",lbPrev);
  $(".lb-next",lb).addEventListener("click",lbNext);
  lb.addEventListener("click",function(e){if(e.target===lb){lbInFs()?lbExitFs():close()}});
  document.addEventListener("keydown",function(e){
    if(lb.hidden)return;
    if(e.key==="Escape"){lbInFs()?lbExitFs():close()}
    if(e.key==="ArrowLeft")lbPrev();
    if(e.key==="ArrowRight")lbNext();
  });
  /* swipe */
  var x0=null;
  lb.addEventListener("touchstart",function(e){x0=e.touches[0].clientX},{passive:true});
  lb.addEventListener("touchend",function(e){
    if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;
    if(Math.abs(dx)>40)(dx<0?lbNext:lbPrev)();x0=null;
  },{passive:true});
  /* ---------- lightbox: fullscreen (punto 3.5) ---------- */
  var lbFsBtn=$(".lb-fs",lb);
  function lbFsActive(){return document.fullscreenElement===lb||document.webkitFullscreenElement===lb}
  function lbInFs(){return lb.classList.contains("is-fullscreen")||lbFsActive()}
  function lbExitFs(){
    if(lbFsActive()){(document.exitFullscreen||document.webkitExitFullscreen).call(document)}
    lb.classList.remove("is-fullscreen");
    lbFsBtn.setAttribute("aria-label","Ver a pantalla completa");
  }
  function lbEnterFs(){
    lb.classList.add("is-fullscreen");
    lbFsBtn.setAttribute("aria-label","Salir de pantalla completa");
    var rq=lb.requestFullscreen||lb.webkitRequestFullscreen;
    if(rq){try{var p=rq.call(lb);if(p&&p.catch){p.catch(function(){})}}catch(err){}}
    /* sin API o si la deniegan: la clase is-fullscreen actúa como pseudo-fullscreen */
  }
  lbFsBtn.addEventListener("click",function(){lbInFs()?lbExitFs():lbEnterFs()});
  document.addEventListener("fullscreenchange",function(){if(!lbFsActive())lbExitFs()});
  document.addEventListener("webkitfullscreenchange",function(){if(!lbFsActive())lbExitFs()});
}

/* ---------- tabs del book ---------- */
$$(".tabs").forEach(function(tabs){
  var btns=$$(".tab",tabs);
  btns.forEach(function(b){b.addEventListener("click",function(){
    btns.forEach(function(o){o.setAttribute("aria-pressed","false")});
    b.setAttribute("aria-pressed","true");
    var f=b.getAttribute("data-filter");
    $$("#galeria-book .g-item").forEach(function(it){
      it.style.display=(f==="todas"||it.getAttribute("data-cat")===f)?"":"none";
    });
  })});
});

/* ---------- vídeos (usa js/videos.js) ---------- */
var V=window.VIDEOS||{};
var modal=$(".video-modal");
function playInline(wrap,v){
  if(/youtube\.com\/embed\//.test(v.src)){
    wrap.innerHTML='<div class="video-embed"><iframe src="'+v.src+'?autoplay=1&rel=0" title="'+v.titulo+'" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>';
  }else{
    wrap.innerHTML='<video class="video-player" controls preload="none" poster="'+v.poster+'"><source src="'+v.src+'" type="video/mp4"></video>';
    var vid=wrap.querySelector("video");if(vid)vid.play();
  }
}
function openVideoModal(id){
  var v=V[id];if(!v||!modal)return;
  $(".box",modal).innerHTML=
    '<button class="vm-close" aria-label="Cerrar">✕</button>'+
    "<h3>"+v.titulo+"</h3>"+
    "<p>Vídeo disponible próximamente en esta web.<br>Mientras tanto puedes verlo en la web original.</p>"+
    '<a class="btn btn-dark" href="'+v.fallbackUrl+'" target="_blank" rel="noopener">Ver en la web original</a>';
  $(".vm-close",modal).addEventListener("click",closeVideoModal);
  modal.hidden=false;
}
function closeVideoModal(){if(modal){modal.hidden=true;var z=$(".box",modal);if(z)z.innerHTML=""}}
if(modal){modal.addEventListener("click",function(e){if(e.target===modal)closeVideoModal()});
  document.addEventListener("keydown",function(e){if(e.key==="Escape")closeVideoModal()})}
$$("[data-video]").forEach(function(card){
  var id=card.getAttribute("data-video"),v=V[id];if(!v)return;
  var btn=$(".video-poster",card);
  if(btn)btn.addEventListener("click",function(){
    if(v.src){ /* reproduce inline */
      var wrap=$(".video-media",card);
      playInline(wrap,v);
    }else{openVideoModal(id)}
  });
});
$$(".video-poster[data-vid]").forEach(function(btn){
  var id=btn.getAttribute("data-vid"),v=V[id];if(!v||btn.__vbound)return;btn.__vbound=true;
  btn.addEventListener("click",function(){
    if(v.src){
      var wrap=btn.closest(".video-media");
      playInline(wrap,v);
    }else{openVideoModal(id)}
  });
});

/* ---------- carrusel horizontal de la portada (punto 1.3) ---------- */
var carHome=$("#carousel-home");
if(carHome){
  function carStep(){
    var it=carHome.querySelector(".g-item");
    var gap=parseFloat(getComputedStyle(carHome).gap)||0;
    return it?it.getBoundingClientRect().width+gap:Math.round(carHome.clientWidth*.7);
  }
  function carAtStart(){return carHome.scrollLeft<=4}
  function carAtEnd(){return carHome.scrollLeft+carHome.clientWidth>=carHome.scrollWidth-4}
  var carPrev=$('[data-car-nav="prev"]'),carNext=$('[data-car-nav="next"]');
  function carPaint(){if(carPrev)carPrev.hidden=carAtStart();if(carNext)carNext.hidden=carAtEnd()}
  $$('[data-car-nav]').forEach(function(b){
    b.addEventListener("click",function(){
      carHome.scrollBy({left:(b.getAttribute("data-car-nav")==="next"?1:-1)*carStep(),behavior:"smooth"});
    });
  });
  carHome.addEventListener("keydown",function(e){
    if(e.key==="ArrowLeft"||e.key==="ArrowRight"){
      e.preventDefault();
      carHome.scrollBy({left:(e.key==="ArrowRight"?1:-1)*carStep(),behavior:"smooth"});
    }
  });
  var carT=null;
  carHome.addEventListener("scroll",function(){if(carT)clearTimeout(carT);carT=setTimeout(carPaint,120)},{passive:true});
  window.addEventListener("resize",carPaint);
  carPaint();
}
})();
