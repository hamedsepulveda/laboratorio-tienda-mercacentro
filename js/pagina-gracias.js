/* gracias.html: envía purchase UNA sola vez por pedido y muestra el resumen. */
(function () {
  var cont = document.getElementById("gracias");
  var pedido = null;
  try { pedido = JSON.parse(sessionStorage.getItem("ca_pedido")); } catch (e) {}

  if (!pedido || !pedido.items) {
    cont.innerHTML = '<div class="vacio"><h1>No hay un pedido reciente</h1>' +
      '<p>Esta página confirma tu compra simulada. Arma un pedido desde el catálogo.</p>' +
      '<a class="btn btn--primario" href="index.html">Ir al catálogo</a></div>';
    return;
  }

  var repetido = pedido.enviado === true;

  if (!repetido) {
    var params = {
      currency: "COP",
      transaction_id: pedido.transaction_id,
      affiliation: pedido.affiliation,
      value: Carrito.valorItems(pedido.items),   // productos con descuento, sin envío
      shipping: pedido.shipping,
      tipo_cliente: pedido.tipo_cliente,
      items: pedido.items
    };
    if (pedido.coupon) params.coupon = pedido.coupon;

    window.gtag("set", "user_properties", { tipo_cliente: pedido.tipo_cliente });
    Analitica.enviar("purchase", params);
    pedido.enviado = true;                         // marcar DESPUÉS de enviar
    try { sessionStorage.setItem("ca_pedido", JSON.stringify(pedido)); } catch (e) {}
  }

  var productos = Carrito.valorItems(pedido.items);
  var filas = pedido.items.map(function (i) {
    return '<li><span>' + i.quantity + ' × ' + i.item_name + '</span><span>' + formatoCOP(i.price * i.quantity) + '</span></li>';
  }).join("");

  cont.innerHTML =
    '<div class="gracias">' +
    '<h1>¡Gracias por tu compra simulada!</h1>' +
    '<p>Este pedido es ficticio: no se cobró nada ni se guardaron datos personales.</p>' +
    '<p class="gracias__id">Pedido <b>' + pedido.transaction_id + '</b></p>' +
    (repetido ? '<p class="aviso">Recargaste esta página: el evento <b>purchase</b> ya se había enviado y no se repite.</p>' : '') +
    '<ul class="resumen__lista">' + filas + '</ul><dl>' +
    '<div><dt>Productos</dt><dd>' + formatoCOP(productos) + '</dd></div>' +
    (pedido.coupon ? '<div class="resumen__desc"><dt>Cupón</dt><dd>' + pedido.coupon + '</dd></div>' : '') +
    '<div><dt>Envío (' + pedido.shipping_tier + ')</dt><dd>' + (pedido.shipping === 0 ? 'Gratis' : formatoCOP(pedido.shipping)) + '</dd></div>' +
    '<div><dt>Pago simulado</dt><dd>' + pedido.payment_type + '</dd></div>' +
    '<div class="resumen__total"><dt>Total</dt><dd>' + formatoCOP(productos + pedido.shipping) + '</dd></div></dl>' +
    '<a class="btn btn--primario" href="index.html">Seguir comprando</a></div>';
})();
