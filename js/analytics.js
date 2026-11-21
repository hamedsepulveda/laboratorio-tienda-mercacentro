/* Google Analytics 4: carga gtag.js solo si el ID de js/config.js es válido.
   Funciones públicas:
     Analitica.enviar(nombre, parametros)
     Analitica.enviarYNavegar(nombre, parametros, url)  */
(function () {
  var cfg = window.TIENDA_CONFIG || {};
  var ID = String(cfg.GA_MEASUREMENT_ID || "").trim();
  var activo = /^G-[A-Z0-9]{4,}$/.test(ID) && ID !== "G-XXXXXXXXXX";

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };

  if (activo) {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ID);
    document.head.appendChild(s);

    gtag("js", new Date());
    if (cfg.DEBUG_MODE === true) gtag("config", ID, { debug_mode: true });
    else gtag("config", ID);
  }

  function registrar(nombre, params) {
    if (window.Monitor) window.Monitor.registrar(nombre, params);
  }

  /* Envía un evento (y lo anota en el monitor). */
  function enviar(nombre, params) {
    params = params || {};
    registrar(nombre, params);
    if (activo) gtag("event", nombre, params);
  }

  /* Envía un evento y navega cuando GA confirma (o a más tardar a los 1200 ms). */
  function enviarYNavegar(nombre, params, url) {
    params = params || {};
    registrar(nombre, params);
    var listo = false;
    function ir() { if (listo) return; listo = true; window.location.href = url; }
    if (!activo) { ir(); return; }
    var conCallback = {};
    for (var k in params) if (Object.prototype.hasOwnProperty.call(params, k)) conCallback[k] = params[k];
    conCallback.event_callback = ir;
    conCallback.event_timeout = 1000;
    gtag("event", nombre, conCallback);
    setTimeout(ir, 1200);
  }

  window.Analitica = { activo: activo, id: ID, enviar: enviar, enviarYNavegar: enviarYNavegar };

  /* page_view: lo envía gtag('config') automáticamente; aquí solo se anota en el monitor. */
  registrar("page_view", { page_title: document.title, page_location: location.href });
})();
