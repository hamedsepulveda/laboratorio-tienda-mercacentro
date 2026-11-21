/* Carrito, cupón, tarifas de envío y construcción de ítems para GA4.
   El carrito vive en localStorage (clave "ca_carrito"). */
(function () {
  var CLAVE = "ca_carrito";
  var CUPON = "BIENVENIDA10";
  var DESCUENTO = 0.10;
  var UMBRAL_ENVIO_GRATIS = 150000;
  var TARIFAS = {
    "Nacional - Estándar": 12000,
    "Nacional - Express": 25000,
    "Internacional - Estándar": 95000,
    "Internacional - Express": 160000
  };
  var PAISES = ["Colombia", "México", "Estados Unidos", "España", "Chile", "Perú", "Argentina", "Alemania"];

  function leer() {
    try {
      var e = JSON.parse(localStorage.getItem(CLAVE));
      if (e && Array.isArray(e.l)) return e;
    } catch (x) {}
    return { l: [], c: null };
  }
  function guardar(e) {
    try { localStorage.setItem(CLAVE, JSON.stringify(e)); } catch (x) {}
    actualizarContador();
  }

  function formatoCOP(n) {
    return "$" + Number(n).toLocaleString("es-CO", { maximumFractionDigits: 0 });
  }

  /* ---------- Cupón ---------- */
  function cuponActivo() { return leer().c === CUPON ? CUPON : null; }
  function aplicarCupon(texto) {
    if (String(texto || "").trim().toUpperCase() !== CUPON) return false;
    var e = leer(); e.c = CUPON; guardar(e); return true;
  }
  function quitarCupon() { var e = leer(); e.c = null; guardar(e); }

  function precioConDescuento(p) { return Math.round(p.precio * (1 - DESCUENTO)); }
  function precioUnitario(p) { return cuponActivo() ? precioConDescuento(p) : p.precio; }

  /* ---------- Líneas ---------- */
  function lineas() {
    var res = [];
    leer().l.forEach(function (x) {
      var p = window.buscarProducto(x.id);
      if (p && x.q > 0) res.push({ producto: p, cantidad: x.q });
    });
    return res;
  }
  function cantidadTotal() {
    var t = 0; lineas().forEach(function (l) { t += l.cantidad; }); return t;
  }
  function agregar(id, n) {
    var e = leer(), f = null;
    e.l.forEach(function (x) { if (x.id === id) f = x; });
    if (f) f.q += n; else e.l.push({ id: id, q: n });
    guardar(e);
  }
  /* Disminuye unidades; devuelve cuántas se quitaron realmente. */
  function disminuir(id, n) {
    var e = leer(), quitadas = 0;
    e.l = e.l.filter(function (x) {
      if (x.id !== id) return true;
      quitadas = Math.min(n, x.q);
      x.q -= quitadas;
      return x.q > 0;
    });
    guardar(e);
    return quitadas;
  }
  function vaciar() { guardar({ l: [], c: null }); }

  /* ---------- Totales ---------- */
  function totales(ls) {
    var bruto = 0, subtotal = 0;
    ls.forEach(function (l) {
      bruto += l.producto.precio * l.cantidad;
      subtotal += precioUnitario(l.producto) * l.cantidad;
    });
    return { bruto: bruto, descuento: bruto - subtotal, subtotal: subtotal };
  }

  /* ---------- Envío ---------- */
  function calcularEnvio(pais, servicio, subtotal) {
    var nacional = pais === "Colombia";
    var tipo = nacional ? "Nacional" : "Internacional";
    var tier = tipo + " - " + servicio;
    var costo = TARIFAS[tier];
    var gratis = nacional && servicio === "Estándar" && subtotal >= UMBRAL_ENVIO_GRATIS;
    return { tipo_cliente: tipo, shipping_tier: tier, tarifa: costo, costo: gratis ? 0 : costo, gratis: gratis };
  }

  /* ---------- Ítems GA4 ---------- */
  function itemGA(p, cantidad, indice, conCupon) {
    var usar = conCupon === undefined ? !!cuponActivo() : conCupon;
    var it = {
      item_id: p.id,
      item_name: p.nombre,
      item_brand: window.MARCA,
      item_category: p.categoria,
      price: usar ? precioConDescuento(p) : p.precio,
      quantity: cantidad,
      index: indice
    };
    if (usar) { it.discount = p.precio - precioConDescuento(p); it.coupon = CUPON; }
    return it;
  }
  function itemsGA(ls) {
    return ls.map(function (l, i) { return itemGA(l.producto, l.cantidad, i); });
  }
  function valorItems(items) {
    var v = 0; items.forEach(function (i) { v += i.price * i.quantity; }); return v;
  }
  /* Agrega "coupon" al evento solo si hay cupón activo. */
  function conCupon(params) {
    var c = cuponActivo(); if (c) params.coupon = c; return params;
  }

  function actualizarContador() {
    var el = document.getElementById("contador-carrito");
    if (el) el.textContent = String(cantidadTotal());
  }
  document.addEventListener("DOMContentLoaded", actualizarContador);

  window.formatoCOP = formatoCOP;
  window.Carrito = {
    CUPON: CUPON, DESCUENTO: DESCUENTO, PAISES: PAISES, TARIFAS: TARIFAS, UMBRAL_ENVIO_GRATIS: UMBRAL_ENVIO_GRATIS,
    cuponActivo: cuponActivo, aplicarCupon: aplicarCupon, quitarCupon: quitarCupon,
    precioUnitario: precioUnitario, precioConDescuento: precioConDescuento,
    lineas: lineas, cantidadTotal: cantidadTotal, agregar: agregar, disminuir: disminuir, vaciar: vaciar,
    totales: totales, calcularEnvio: calcularEnvio,
    itemGA: itemGA, itemsGA: itemsGA, valorItems: valorItems, conCupon: conCupon,
    actualizarContador: actualizarContador
  };
})();
