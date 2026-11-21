/* index.html: catálogo + banner del cupón. Eventos: view_item_list, view_promotion,
   select_item, select_promotion. */
(function () {
  var LISTA_ID = "catalogo_principal", LISTA_NOMBRE = "Catálogo principal";
  var contenedor = document.getElementById("catalogo");

  contenedor.innerHTML = window.PRODUCTOS.map(function (p) {
    var unit = Carrito.precioUnitario(p);
    var precio = Carrito.cuponActivo()
      ? '<span class="precio"><s>' + formatoCOP(p.precio) + '</s> ' + formatoCOP(unit) + '</span>'
      : '<span class="precio">' + formatoCOP(p.precio) + '</span>';
    return '<a class="tarjeta" href="producto.html?id=' + p.id + '" data-id="' + p.id + '">' +
      '<div class="bloque" style="background:' + p.color + '"><span>' + p.sigla + '</span></div>' +
      '<div class="tarjeta__cuerpo"><span class="tarjeta__cat">' + p.categoria + '</span>' +
      '<h3>' + p.nombre + '</h3>' + precio + '</div></a>';
  }).join("");

  function paramsLista(items) {
    return { currency: "COP", item_list_id: LISTA_ID, item_list_name: LISTA_NOMBRE, items: items };
  }

  /* view_item_list al cargar */
  Analitica.enviar("view_item_list", paramsLista(
    window.PRODUCTOS.map(function (p, i) { return Carrito.itemGA(p, 1, i); })
  ));

  /* select_item antes de navegar */
  contenedor.addEventListener("click", function (e) {
    var a = e.target.closest("a.tarjeta");
    if (!a) return;
    var p = window.buscarProducto(a.getAttribute("data-id"));
    var indice = window.PRODUCTOS.indexOf(p);
    var params = paramsLista([Carrito.itemGA(p, 1, indice)]);
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) { Analitica.enviar("select_item", params); return; }
    e.preventDefault();
    Analitica.enviarYNavegar("select_item", params, a.getAttribute("href"));
  });

  /* Banner del cupón */
  var banner = document.getElementById("banner-cupon");
  if (!Carrito.cuponActivo()) {
    banner.hidden = false;
    // Ítem destacado del banner: el Kit degustación, sin cupón aplicado todavía.
    var kit = window.buscarProducto("KIT-008");
    var paramsPromo = {
      currency: "COP",
      promotion_id: "BIENVENIDA10",
      promotion_name: "Cupón de bienvenida 10%",
      creative_name: "banner_inicio_bienvenida",
      creative_slot: "inicio_superior",
      items: [Carrito.itemGA(kit, 1, 0, false)]
    };
    Analitica.enviar("view_promotion", paramsPromo);

    var yaClic = false;
    function usarBanner() {
      if (yaClic) return; yaClic = true;
      Carrito.aplicarCupon("BIENVENIDA10");
      Analitica.enviarYNavegar("select_promotion", paramsPromo, "carrito.html");
    }
    banner.addEventListener("click", usarBanner);
    banner.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); usarBanner(); }
    });
  }
})();
