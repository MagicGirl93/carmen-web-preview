/* Formulario de contacto: envío por FormSubmit (AJAX) con degradación elegante.
   ✏️ IMPORTANTE: el primer envío real dispara un email de activación a carmen.tur@icloud.com:
   hay que hacer clic en su enlace una vez para que el formulario empiece a entregar. */
(function(){
"use strict";
var form=document.getElementById("contacto-form");
if(!form)return;
var ok=document.getElementById("form-ok"),err=document.getElementById("form-err");
form.addEventListener("submit",function(e){
  e.preventDefault();
  ok.hidden=true;err.hidden=true;
  var btn=form.querySelector('button[type="submit"]');
  btn.disabled=true;btn.textContent="Enviando…";
  var data={};
  new FormData(form).forEach(function(v,k){data[k]=v});
  fetch("https://formsubmit.co/ajax/carmen.tur@icloud.com",{
    method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},
    body:JSON.stringify(data)
  }).then(function(r){
    /* Endurecer (punto 5.1): inspeccionar el estado HTTP y el cuerpo JSON antes de
       mostrar el mensaje de éxito. FormSubmit AJAX responde {"success":true} en envíos
       correctos; si el estado no es 2xx o el JSON indica error, caemos al .catch() y
       se muestra #form-err con el botón de reintento clásico. */
    return r.json().then(function(j){if(!r.ok||!(j&&j.success)){throw new Error("FormSubmit: envío rechazado");}});
  }).then(function(){
    form.reset();ok.hidden=false;ok.scrollIntoView({behavior:"smooth",block:"center"});
  }).catch(function(){
    /* Sin red o bloqueo: degradar al envío clásico (POST del propio form) */
    err.hidden=false;
    var retry=document.createElement("button");
    retry.type="button";retry.className="btn btn-dark";retry.textContent="Reintentar envío clásico";
    retry.addEventListener("click",function(){form.submit()});
    err.appendChild(retry);
  }).finally(function(){btn.disabled=false;btn.textContent="Enviar"});
});
})();
