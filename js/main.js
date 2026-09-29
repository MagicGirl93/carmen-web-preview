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
  var lbImg=$("img",lb),lbCap=$("figcaption",lb),items=[],idx=0;
  function show(i){
    idx=(i+items.length)%items.length;
    var a=items[idx];
    lbImg.src=a.getAttribute("data-full");lbImg.alt=a.getAttribute("data-alt")||"";
    lbCap.textContent=(a.getAttribute("data-alt")||"")+" · "+(idx+1)+" / "+items.length;
    var pre=new Image();pre.src=items[(idx+1)%items.length].getAttribute("data-full");
  }
  function open(a){items=$$("[data-lightbox]");show(items.indexOf(a));lb.hidden=false;document.body.style.overflow="hidden";$(".lb-close",lb).focus()}
  function close(){lb.hidden=true;document.body.style.overflow="";lbImg.src=""}
  document.addEventListener("click",function(e){
    var a=e.target.closest("[data-lightbox]");
    if(a){e.preventDefault();open(a)}
  });
  $(".lb-close",lb).addEventListener("click",close);
  $(".lb-prev",lb).addEventListener("click",function(){show(idx-1)});
  $(".lb-next",lb).addEventListener("click",function(){show(idx+1)});
  lb.addEventListener("click",function(e){if(e.target===lb)close()});
  document.addEventListener("keydown",function(e){
    if(lb.hidden)return;
    if(e.key==="Escape")close();
    if(e.key==="ArrowLeft")show(idx-1);
    if(e.key==="ArrowRight")show(idx+1);
  });
  /* swipe */
  var x0=null;
  lb.addEventListener("touchstart",function(e){x0=e.touches[0].clientX},{passive:true});
  lb.addEventListener("touchend",function(e){
    if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;
    if(Math.abs(dx)>40)show(idx+(dx<0?1:-1));x0=null;
  },{passive:true});
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
})();
