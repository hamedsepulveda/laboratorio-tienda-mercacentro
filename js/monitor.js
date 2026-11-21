/* Monitor de eventos: ayuda didáctica. Muestra qué se envía a GA4 en cada
   página. No es necesario para que la tienda funcione. */
(function () {
  var CLAVE_EVENTOS = "ca_eventos";
  var CLAVE_ORIGEN = "ca_origen";
  var CLAVE_ESTADO = "ca_monitor_oculto"; // localStorage: recuerda Ocultar/Mostrar
  var MAXIMO = 12;
  var cfg = window.TIENDA_CONFIG || {};
  var ID = String(cfg.GA_MEASUREMENT_ID || "").trim();
  var conectado = /^G-[A-Z0-9]{4,}$/.test(ID) && ID !== "G-XXXXXXXXXX";

  function leerJSON(almacen, clave, defecto) {
    try { var v = JSON.parse(almacen.getItem(clave)); return v === null ? defecto : v; } catch (e) { return defecto; }
  }
  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }
  function fmt(n) { return Number(n).toLocaleString("es-CO"); }
  function hora() {
    var d = new Date(), p = function (x) { return (x < 10 ? "0" : "") + x; };
    return p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
  }

  function resumen(nombre, p) {
    var s = [];
    if (nombre === "page_view") {
      try { var u = new URL(p.page_location); return (u.pathname.replace(/^\//, "") + u.search) || "/"; } catch (e) { return ""; }
    }
    if (p.transaction_id) s.push(p.transaction_id);
    if (p.promotion_id) s.push("promo " + p.promotion_id);
    if (p.item_list_name) s.push(p.item_list_name);
    if (p.items && p.items.length) {
      if (p.items.length === 1) s.push(p.items[0].item_name + " × " + p.items[0].quantity);
      else {
        var u2 = 0; p.items.forEach(function (i) { u2 += i.quantity; });
        s.push(p.items.length + " ítems (" + u2 + " uds)");
      }
    }
    if (p.value !== undefined) s.push("value " + fmt(p.value) + " COP");
    if (p.shipping !== undefined) s.push("envío " + fmt(p.shipping) + " COP");
    if (p.coupon) s.push("cupón " + p.coupon);
    if (p.shipping_tier) s.push(p.shipping_tier);
    if (p.payment_type) s.push(p.payment_type);
    if (p.tipo_cliente) s.push("cliente " + p.tipo_cliente);
    return s.join(" · ");
  }

  function origen() {
    var o = leerJSON(sessionStorage, CLAVE_ORIGEN, null);
    if (!o) {
      var q = new URLSearchParams(location.search);
      var tiene = q.get("utm_source") || q.get("utm_medium") || q.get("utm_campaign");
      o = tiene ? { s: q.get("utm_source") || "(no definido)", m: q.get("utm_medium") || "(no definido)", c: q.get("utm_campaign") || "(no definido)" } : { directo: true };
      try { sessionStorage.setItem(CLAVE_ORIGEN, JSON.stringify(o)); } catch (e) {}
    }
    return o.directo ? "directo (sin UTM)" : o.s + " / " + o.m + " · " + o.c;
  }

  function borrarCookiesGA() {
    var host = location.hostname, partes = host.split("."), dominios = [host, "." + host];
    for (var i = 1; i < partes.length - 1; i++) {
      var d = partes.slice(i).join(".");
      dominios.push(d, "." + d);
    }
    var nombres = document.cookie.split(";").map(function (c) { return c.split("=")[0].trim(); })
      .filter(function (n) { return /^_ga/.test(n) || n === "_gid"; });
    var caduca = "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    nombres.forEach(function (n) {
      document.cookie = n + caduca;
      dominios.forEach(function (d) { document.cookie = n + caduca + "; domain=" + d; });
    });
  }

  function simularNuevoVisitante() {
    borrarCookiesGA();
    try { localStorage.removeItem("ca_carrito"); } catch (e) {}
    try { sessionStorage.clear(); } catch (e) {}
    location.href = "index.html";
  }

  /* ---------- Interfaz ---------- */
  var panel, lista, estadoEl, origenEl, boton;

  function pintarLista() {
    if (!lista) return;
    var ev = leerJSON(sessionStorage, CLAVE_EVENTOS, []);
    if (!ev.length) { lista.innerHTML = '<li class="monitor__vacio">Aún no hay eventos.</li>'; return; }
    lista.innerHTML = ev.map(function (e) {
      return '<li class="monitor__evento"><div class="monitor__linea"><time>' + esc(e.t) + '</time><b>' + esc(e.n) + '</b></div>' +
        '<div class="monitor__resumen">' + esc(e.r) + '</div>' +
        '<details><summary>Ver parámetros</summary><pre>' + esc(e.j) + '</pre></details></li>';
    }).join("");
  }

  function aplicarEstado(oculto) {
    document.body.classList.toggle("monitor-oculto", oculto);
    if (boton) { boton.textContent = oculto ? "Mostrar" : "Ocultar"; boton.setAttribute("aria-expanded", String(!oculto)); }
  }

  function construir() {
    panel = document.createElement("aside");
    panel.className = "monitor";
    panel.setAttribute("aria-label", "Monitor de eventos de Google Analytics 4");
    panel.innerHTML =
      '<div class="monitor__cab"><strong>Monitor de eventos GA4</strong><button type="button" id="monitor-toggle" aria-expanded="true">Ocultar</button></div>' +
      '<div class="monitor__cuerpo">' +
      '<div id="monitor-estado" class="monitor__estado"></div>' +
      '<div class="monitor__origen"><span>Origen de la visita</span><b id="monitor-origen"></b></div>' +
      '<div class="monitor__titulo">Últimos ' + MAXIMO + ' eventos</div>' +
      '<ol id="monitor-lista" class="monitor__lista"></ol>' +
      '<button type="button" id="monitor-reset" class="monitor__reset">Simular nuevo visitante</button>' +
      '</div>';
    document.body.appendChild(panel);

    lista = panel.querySelector("#monitor-lista");
    estadoEl = panel.querySelector("#monitor-estado");
    origenEl = panel.querySelector("#monitor-origen");
    boton = panel.querySelector("#monitor-toggle");

    if (conectado) {
      estadoEl.className = "monitor__estado monitor__estado--ok";
      estadoEl.textContent = "Conectado a " + ID + (cfg.DEBUG_MODE === true ? " · modo depuración" : "");
    } else {
      estadoEl.className = "monitor__estado monitor__estado--error";
      estadoEl.textContent = "Sin ID de medición: los eventos solo se muestran aquí. Edita js/config.js.";
    }
    origenEl.textContent = origen();

    var oculto = false;
    try { oculto = localStorage.getItem(CLAVE_ESTADO) === "1"; } catch (e) {}
    aplicarEstado(oculto);
    boton.addEventListener("click", function () {
      var nuevo = !document.body.classList.contains("monitor-oculto");
      try { localStorage.setItem(CLAVE_ESTADO, nuevo ? "1" : "0"); } catch (e) {}
      aplicarEstado(nuevo);
    });
    panel.querySelector("#monitor-reset").addEventListener("click", simularNuevoVisitante);
    pintarLista();
  }

  window.Monitor = {
    registrar: function (nombre, params) {
      params = params || {};
      var ev = leerJSON(sessionStorage, CLAVE_EVENTOS, []);
      ev.unshift({ t: hora(), n: nombre, r: resumen(nombre, params), j: JSON.stringify(params, null, 2) });
      ev = ev.slice(0, MAXIMO);
      try { sessionStorage.setItem(CLAVE_EVENTOS, JSON.stringify(ev)); } catch (e) {}
      pintarLista();
    }
  };

  if (document.body) construir(); else document.addEventListener("DOMContentLoaded", construir);
})();
