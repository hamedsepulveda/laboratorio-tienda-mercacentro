/* producto.html?id=ABC-001: detalle. Eventos: view_item, add_to_cart. */
(function () {
  var cont = document.getElementById("detalle");
  var id = new URLSearchParams(location.search).get("id");
  var p = window.buscarProducto(id);

  if (!p) {
    cont.innerHTML = '<div class="vacio"><h1>No encontramos ese producto</h1>' +
      '<p>El enlace no corresponde a ningún producto del catálogo.</p>' +
      '<a class="btn btn--primario" href="index.html">Volver al catálogo</a></div>';
    return;
  }

  var cantidad = 1;
  var unit = Carrito.precioUnitario(p);
  var precio = Carrito.cuponActivo()
    ? '<s>' + formatoCOP(p.precio) + '</s> ' + formatoCOP(unit) + ' <small>con cupón ' + Carrito.CUPON + '</small>'
    : formatoCOP(p.precio);

  document.title = p.nombre + " · Cumbre Andina";
  cont.innerHTML =
    '<div class="detalle__bloque bloque bloque--grande" style="background:' + p.color + '"><span>' + p.sigla + '</span></div>' +
    '<div class="detalle__info">' +
    '<a class="enlace-volver" href="index.html">‹ Volver al catálogo</a>' +
    '<span class="tarjeta__cat">' + p.categoria + '</span>' +
    '<h1>' + p.nombre + '</h1>' +
    '<p class="detalle__precio">' + precio + '</p>' +
    '<p class="detalle__desc">' + p.descripcion + '</p>' +
    '<div class="cantidad" role="group" aria-label="Cantidad">' +
    '<button type="button" id="menos" aria-label="Disminuir cantidad">−</button>' +
    '<output id="cant" aria-live="polite">1</output>' +
    '<button type="button" id="mas" aria-label="Aumentar cantidad">+</button></div>' +
    '<button type="button" id="agregar" class="btn btn--primario">Agregar al carrito</button>' +
    '<p id="confirmacion" class="confirmacion" hidden></p>' +
    '</div>';

  // view_item al abrir el detalle
  Analitica.enviar("view_item", {
    currency: "COP",
    value: unit,
    items: [Carrito.itemGA(p, 1, 0)]
  });

  var out = document.getElementById("cant");
  document.getElementById("menos").addEventListener("click", function () {
    if (cantidad > 1) { cantidad--; out.textContent = cantidad; }
  });
  document.getElementById("mas").addEventListener("click", function () {
    if (cantidad < 20) { cantidad++; out.textContent = cantidad; }
  });

  document.getElementById("agregar").addEventListener("click", function () {
    var items = [Carrito.itemGA(p, cantidad, 0)];
    Carrito.agregar(p.id, cantidad);
    Analitica.enviar("add_to_cart", { currency: "COP", value: Carrito.valorItems(items), items: items });
    var c = document.getElementById("confirmacion");
    c.hidden = false;
    c.innerHTML = 'Agregaste ' + cantidad + (cantidad === 1 ? ' unidad' : ' unidades') +
      ' al carrito. <a href="carrito.html">Ver carrito</a>';
    cantidad = 1; out.textContent = "1";
  });
})();
