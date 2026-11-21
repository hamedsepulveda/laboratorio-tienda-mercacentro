/* carrito.html. Eventos: view_cart, add_to_cart, remove_from_cart. */
(function () {
  var cont = document.getElementById("carrito");
  var primeraVez = true;

  function pintar() {
    var ls = Carrito.lineas();
    var cupon = Carrito.cuponActivo();
    var formCupon =
      '<div class="cupon">' +
      (cupon
        ? '<p class="cupon__ok">Cupón <b>' + cupon + '</b> aplicado: 10 % de descuento. <button type="button" id="quitar-cupon" class="enlace-btn">Quitar cupón</button></p>'
        : '<label for="codigo-cupon">¿Tienes un cupón?</label>' +
          '<div class="cupon__fila"><input id="codigo-cupon" type="text" autocomplete="off" placeholder="BIENVENIDA10">' +
          '<button type="button" id="aplicar-cupon" class="btn btn--secundario">Aplicar cupón</button></div>' +
          '<p id="msg-cupon" class="cupon__msg" role="status"></p>') +
      '</div>';

    if (!ls.length) {
      cont.innerHTML = '<div class="vacio"><h1>Tu carrito está vacío</h1>' +
        '<p>Agrega café, cacao o accesorios desde el catálogo.</p>' +
        '<a class="btn btn--primario" href="index.html">Ir al catálogo</a></div>' + formCupon;
      enlazar(ls);
      return;
    }

    var t = Carrito.totales(ls);
    var filas = ls.map(function (l, i) {
      var p = l.producto, u = Carrito.precioUnitario(p);
      return '<li class="linea">' +
        '<div class="bloque bloque--mini" style="background:' + p.color + '"><span>' + p.sigla + '</span></div>' +
        '<div class="linea__info"><a href="producto.html?id=' + p.id + '">' + p.nombre + '</a>' +
        '<span class="linea__unit">' + (cupon ? '<s>' + formatoCOP(p.precio) + '</s> ' : '') + formatoCOP(u) + ' c/u</span></div>' +
        '<div class="cantidad cantidad--chica" role="group" aria-label="Cantidad de ' + p.nombre + '">' +
        '<button type="button" data-accion="menos" data-i="' + i + '" aria-label="Disminuir">−</button>' +
        '<output>' + l.cantidad + '</output>' +
        '<button type="button" data-accion="mas" data-i="' + i + '" aria-label="Aumentar">+</button></div>' +
        '<strong class="linea__total">' + formatoCOP(u * l.cantidad) + '</strong>' +
        '<button type="button" class="enlace-btn" data-accion="quitar" data-i="' + i + '">Quitar</button></li>';
    }).join("");

    cont.innerHTML =
      '<h1>Tu carrito</h1><div class="carrito__grid"><div>' +
      '<ul class="lineas">' + filas + '</ul>' + formCupon + '</div>' +
      '<aside class="resumen"><h2>Resumen</h2>' +
      '<dl><div><dt>Productos</dt><dd>' + formatoCOP(t.bruto) + '</dd></div>' +
      (cupon ? '<div class="resumen__desc"><dt>Descuento ' + cupon + '</dt><dd>−' + formatoCOP(t.descuento) + '</dd></div>' : '') +
      '<div class="resumen__total"><dt>Subtotal</dt><dd>' + formatoCOP(t.subtotal) + '</dd></div></dl>' +
      '<p class="resumen__nota">El envío se calcula en el siguiente paso. Nacional Estándar es gratis desde ' + formatoCOP(Carrito.UMBRAL_ENVIO_GRATIS) + ' en productos.</p>' +
      '<a class="btn btn--primario btn--ancho" href="checkout.html">Ir al checkout</a></aside></div>';
    enlazar(ls);

    if (primeraVez) {
      primeraVez = false;
      var items = Carrito.itemsGA(ls);
      Analitica.enviar("view_cart", Carrito.conCupon({ currency: "COP", value: Carrito.valorItems(items), items: items }));
    }
  }

  function enlazar(ls) {
    var ap = document.getElementById("aplicar-cupon");
    if (ap) {
      var inp = document.getElementById("codigo-cupon"), msg = document.getElementById("msg-cupon");
      var intentar = function () {
        if (Carrito.aplicarCupon(inp.value)) pintar();
        else msg.textContent = "Ese cupón no es válido. Prueba con BIENVENIDA10.";
      };
      ap.addEventListener("click", intentar);
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") intentar(); });
    }
    var q = document.getElementById("quitar-cupon");
    if (q) q.addEventListener("click", function () { Carrito.quitarCupon(); pintar(); });

    cont.querySelectorAll("[data-accion]").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = Number(b.getAttribute("data-i")), l = ls[i], a = b.getAttribute("data-accion");
        var n = a === "quitar" ? l.cantidad : 1;
        var items = [Carrito.itemGA(l.producto, n, i)];
        var params = { currency: "COP", value: Carrito.valorItems(items), items: items };
        if (a === "mas") {
          Carrito.agregar(l.producto.id, 1);
          Analitica.enviar("add_to_cart", params);
        } else {
          Carrito.disminuir(l.producto.id, n);
          Analitica.enviar("remove_from_cart", params);
        }
        pintar();
      });
    });
  }

  pintar();
})();
