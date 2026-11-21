/* checkout.html en dos pasos (envío y pago simulado).
   Eventos: begin_checkout, add_shipping_info, add_payment_info.
   No se pide ni se guarda correo, teléfono, documento ni datos de tarjeta. */
(function () {
  var ls = Carrito.lineas();
  if (!ls.length) { location.replace("carrito.html"); return; }

  var items = Carrito.itemsGA(ls);
  var tot = Carrito.totales(ls);
  var valor = Carrito.valorItems(items);          // productos con descuento, sin envío
  var cupon = Carrito.cuponActivo();
  var envio = null, paso = 1;

  // Selector de países
  var selPais = document.getElementById("pais");
  selPais.innerHTML = Carrito.PAISES.map(function (p) { return '<option value="' + p + '">' + p + '</option>'; }).join("");

  function servicioElegido() { return document.querySelector('input[name="servicio"]:checked').value; }

  function pintarResumen() {
    var e = Carrito.calcularEnvio(selPais.value, servicioElegido(), tot.subtotal);
    // Etiquetas de tarifa en las opciones
    ["Estándar", "Express"].forEach(function (s) {
      var c = Carrito.calcularEnvio(selPais.value, s, tot.subtotal);
      document.getElementById("tarifa-" + s).textContent = c.gratis ? "Gratis" : formatoCOP(c.costo);
    });
    var lineasHTML = ls.map(function (l) {
      return '<li><span>' + l.cantidad + ' × ' + l.producto.nombre + '</span><span>' +
        formatoCOP(Carrito.precioUnitario(l.producto) * l.cantidad) + '</span></li>';
    }).join("");
    document.getElementById("resumen-checkout").innerHTML =
      '<h2>Tu pedido</h2><ul class="resumen__lista">' + lineasHTML + '</ul><dl>' +
      '<div><dt>Productos</dt><dd>' + formatoCOP(tot.bruto) + '</dd></div>' +
      (cupon ? '<div class="resumen__desc"><dt>Descuento ' + cupon + '</dt><dd>−' + formatoCOP(tot.descuento) + '</dd></div>' : '') +
      '<div><dt>Envío (' + e.shipping_tier + ')</dt><dd>' + (e.gratis ? 'Gratis' : formatoCOP(e.costo)) + '</dd></div>' +
      '<div class="resumen__total"><dt>Total</dt><dd>' + formatoCOP(tot.subtotal + e.costo) + '</dd></div></dl>';
    return e;
  }

  function mostrarPaso(n) {
    paso = n;
    document.getElementById("paso-envio").hidden = n !== 1;
    document.getElementById("paso-pago").hidden = n !== 2;
    document.getElementById("ind-1").classList.toggle("activo", n === 1);
    document.getElementById("ind-2").classList.toggle("activo", n === 2);
    window.scrollTo(0, 0);
  }

  selPais.addEventListener("change", pintarResumen);
  document.querySelectorAll('input[name="servicio"]').forEach(function (r) { r.addEventListener("change", pintarResumen); });
  pintarResumen();

  // begin_checkout al abrir la página
  Analitica.enviar("begin_checkout", Carrito.conCupon({ currency: "COP", value: valor, items: items }));

  // Paso 1 → add_shipping_info
  document.getElementById("continuar-pago").addEventListener("click", function () {
    var nombre = document.getElementById("nombre"), error = document.getElementById("error-nombre");
    if (nombre.value.trim().length < 2) {
      error.textContent = "Escribe un nombre ficticio para continuar.";
      nombre.focus(); return;
    }
    error.textContent = "";
    envio = pintarResumen();
    // Propiedad de usuario antes de los eventos que dependen de ella
    window.gtag("set", "user_properties", { tipo_cliente: envio.tipo_cliente });
    Analitica.enviar("add_shipping_info", Carrito.conCupon({
      currency: "COP", value: valor, shipping_tier: envio.shipping_tier, items: items
    }));
    mostrarPaso(2);
  });

  document.getElementById("volver-envio").addEventListener("click", function () { mostrarPaso(1); });

  function nuevoIdPedido() {
    var d = new Date(), p = function (n) { return (n < 10 ? "0" : "") + n; };
    var azar = Math.random().toString(36).slice(2, 7).toUpperCase();
    return "CA-" + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "-" + Date.now().toString(36).toUpperCase() + azar;
  }

  // Paso 2 → add_payment_info y paso a la confirmación
  var pagando = false;
  document.getElementById("pagar").addEventListener("click", function () {
    if (pagando || !envio) return;
    pagando = true;
    this.disabled = true;
    var pago = document.querySelector('input[name="pago"]:checked').value;

    var pedido = {
      transaction_id: nuevoIdPedido(),
      affiliation: "Cumbre Andina - Tienda en línea",
      value: valor,
      shipping: envio.costo,
      coupon: cupon || null,
      tipo_cliente: envio.tipo_cliente,
      shipping_tier: envio.shipping_tier,
      payment_type: pago,
      items: items,
      enviado: false
    };
    try { sessionStorage.setItem("ca_pedido", JSON.stringify(pedido)); } catch (e) {}
    Carrito.vaciar();

    var paramsPago = { currency: "COP", value: valor, payment_type: pago, items: items };
    if (cupon) paramsPago.coupon = cupon;
    Analitica.enviarYNavegar("add_payment_info", paramsPago, "gracias.html");
  });
})();
