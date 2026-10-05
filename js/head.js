/* Corre en el <head>, antes de pintar: decide si se muestra la intro (una vez por visita). */
(function(){
  var d = document.documentElement, seen = false;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { seen = sessionStorage.getItem('tz-intro'); } catch (e) {}
  if (!seen) { d.classList.add('intro-on'); setTimeout(function(){ d.classList.remove('intro-on'); }, 8000); }
})();
