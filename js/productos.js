/* Catálogo de Cumbre Andina (datos ficticios). Precios enteros en COP.
   "sigla" y "color" dibujan el bloque de color que sustituye a la foto. */
window.MARCA = "Cumbre Andina";

window.PRODUCTOS = [
  { id: "CAF-001", nombre: "Café Huila, tostión media, 340 g", categoria: "Café", precio: 38000,
    descripcion: "Café de altura del sur del Huila con notas a panela, caramelo y cítricos suaves. Tostión media, ideal para filtrado y espresso.",
    sigla: "HU", color: "#8A4B2A" },
  { id: "CAF-002", nombre: "Café Nariño, tostión clara, 340 g", categoria: "Café", precio: 42000,
    descripcion: "Cultivado cerca de los 2.000 metros sobre el nivel del mar. Acidez brillante, notas florales y a frutos rojos.",
    sigla: "NA", color: "#B9733A" },
  { id: "CAF-003", nombre: "Café Sierra Nevada orgánico, 340 g", categoria: "Café", precio: 46000,
    descripcion: "Café orgánico de la Sierra Nevada de Santa Marta. Cuerpo cremoso, final a cacao y nueces.",
    sigla: "SN", color: "#2F6B4F" },
  { id: "CAC-004", nombre: "Cacao del Tolima en polvo, 250 g", categoria: "Cacao", precio: 28000,
    descripcion: "Cacao puro sin azúcar añadida, molido en frío. Para bebidas, repostería y recetas saladas.",
    sigla: "CT", color: "#5A2E1B" },
  { id: "CAC-005", nombre: "Chocolate de mesa artesanal, 500 g", categoria: "Cacao", precio: 24000,
    descripcion: "Pastillas de chocolate con canela, para preparar en olla y batir con molinillo como se hace en casa.",
    sigla: "CM", color: "#3E2316" },
  { id: "ACC-006", nombre: "Prensa francesa de cerámica", categoria: "Accesorios", precio: 89000,
    descripcion: "Prensa francesa de cerámica esmaltada, capacidad de 600 ml. Mantiene el calor y no altera el sabor.",
    sigla: "PF", color: "#4C6A6B" },
  { id: "ACC-007", nombre: "Molinillo manual de madera", categoria: "Accesorios", precio: 135000,
    descripcion: "Molinillo manual con muelas de acero y cuerpo de madera torneada. Ajuste de molienda de fina a gruesa.",
    sigla: "MM", color: "#9A6B2F" },
  { id: "KIT-008", nombre: "Kit degustación Colombia (3 × 100 g)", categoria: "Kits", precio: 79000,
    descripcion: "Tres cafés de origen en bolsas de 100 g (Huila, Nariño y Sierra Nevada) para comparar sabores. Buen regalo.",
    sigla: "KD", color: "#B8691A" }
];

window.buscarProducto = function (id) {
  for (var i = 0; i < window.PRODUCTOS.length; i++) {
    if (window.PRODUCTOS[i].id === id) return window.PRODUCTOS[i];
  }
  return null;
};
