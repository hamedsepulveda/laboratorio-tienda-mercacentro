# Cumbre Andina · Tienda ficticia para el laboratorio de GA4

Tienda en línea **ficticia** de café y cacao de especialidad colombiano, creada para el laboratorio académico de Google Analytics 4 del *Diplomado en E-commerce y Negocios Internacionales Digitales*.

- Solo HTML, CSS y JavaScript puros. Sin frameworks, sin npm, sin compilación.
- Sin servidor, sin base de datos y **sin pagos reales**.
- No pide ni guarda correo, teléfono, documento ni datos de tarjeta.
- Incluye un **monitor de eventos** (panel derecho) para ver qué se envía a GA4.

## 1. Lo único que debes editar: `js/config.js`

```js
window.TIENDA_CONFIG = {
  GA_MEASUREMENT_ID: "G-XXXXXXXXXX", // ← pega aquí tu ID de medición
  DEBUG_MODE: true                   // true = DebugView; false = modo normal
};
```

1. En GA4: **Administrar → Flujos de datos → tu flujo web → ID de medición** (empieza por `G-`).
2. Pégalo entre las comillas, guarda y vuelve a publicar.
3. Mientras el ID sea `G-XXXXXXXXXX`, **no se carga Google Analytics** y el monitor muestra un aviso rojo.
4. Con `DEBUG_MODE: true` verás los eventos en **Administrar → DebugView**. Con `false` se envían sin `debug_mode`.

## 2. Estructura de archivos

```
cumbre-andina/
├── index.html          Catálogo + banner del cupón
├── producto.html       Detalle (producto.html?id=CAF-001)
├── carrito.html        Carrito y cupón
├── checkout.html       Checkout en dos pasos (envío y pago simulado)
├── gracias.html        Confirmación (envía purchase)
├── css/estilos.css
└── js/
    ├── config.js       ← lo único que editas
    ├── analytics.js    Carga gtag.js y expone Analitica.enviar / enviarYNavegar
    ├── monitor.js      Monitor de eventos (ayuda didáctica)
    ├── productos.js    Los 8 productos
    ├── carrito.js      Carrito, cupón, tarifas e ítems GA4
    └── pagina-*.js     Un archivo por página
```

> `monitor.js` es el único archivo adicional a la lista base: contiene el panel didáctico y se puede quitar sin romper la tienda si eliminas su `<script>` y las llamadas a `Monitor`.

## 3. Reglas de negocio

- **Cupón `BIENVENIDA10`:** 10 % de descuento por unidad (precio redondeado al peso entero). Se aplica escribiéndolo en el carrito o haciendo clic en el banner del inicio.
- **Envío (COP):** Nacional Estándar 12.000 · Nacional Express 25.000 · Internacional Estándar 95.000 · Internacional Express 160.000. Nacional Estándar es **gratis** cuando los productos (ya con descuento) suman 150.000 o más.
- **Países:** Colombia (Nacional) y México, Estados Unidos, España, Chile, Perú, Argentina y Alemania (Internacional).
- **Pago simulado:** Tarjeta de crédito, PSE, Nequi o PayPal. No se pide ningún dato.

## 4. Contrato de medición

Todos los eventos llevan `currency: "COP"`. Cada ítem lleva `item_id`, `item_name`, `item_brand`, `item_category`, `price`, `quantity` e `index` (empieza en 0). Con cupón activo, `price` es el precio unitario con descuento y se agregan `discount` (por unidad) y `coupon`.

| Evento | Cuándo se envía | Parámetros principales |
|---|---|---|
| `view_item_list` | Al cargar el catálogo | `item_list_id` = `catalogo_principal`, `item_list_name`, `items` |
| `view_promotion` | Al mostrarse el banner del cupón | `promotion_id` = `BIENVENIDA10`, `promotion_name`, `creative_name`, `creative_slot`, `items` |
| `select_promotion` | Clic en el banner (aplica el cupón y va al carrito) | Los mismos que `view_promotion` |
| `select_item` | Clic en un producto del catálogo, antes de navegar | `item_list_id`, `item_list_name`, `items` |
| `view_item` | Al abrir el detalle | `value`, `items` |
| `add_to_cart` | Al agregar o aumentar unidades | `value`, `items` (`quantity` = unidades agregadas) |
| `remove_from_cart` | Al quitar o disminuir unidades | `value`, `items` |
| `view_cart` | Al abrir el carrito con productos | `value`, `coupon` (si existe), `items` |
| `begin_checkout` | Al abrir `checkout.html` | `value`, `coupon`, `items` |
| `add_shipping_info` | Clic en "Continuar al pago" | `value`, `coupon`, `shipping_tier`, `items` |
| `add_payment_info` | Clic en "Pagar (simulado)" | `value`, `coupon`, `payment_type`, `items` |
| `purchase` | Al cargar `gracias.html`, **una sola vez por pedido** | `transaction_id`, `affiliation`, `value`, `shipping`, `coupon`, `tipo_cliente`, `items` |

Valores exactos de `shipping_tier`: `Nacional - Estándar`, `Nacional - Express`, `Internacional - Estándar`, `Internacional - Express`.

**Decisiones de diseño que conviene conocer**

- `value` es siempre el total de **productos con descuento, sin envío** (Σ `price × quantity`); el envío va aparte en `shipping` (solo en `purchase`).
- `page_view` lo envía GA4 automáticamente con `gtag('config')`; el monitor lo anota en cada página.
- Se ejecuta `gtag('set', 'user_properties', { tipo_cliente })` al confirmar el envío y otra vez justo antes de `purchase`.
- El pedido se guarda en `sessionStorage` antes de ir a `gracias.html` y se marca como enviado **después** de `purchase`; recargar esa página no lo repite. El carrito se vacía al pagar.
- La navegación de `select_item`, `select_promotion` y `add_payment_info` usa `event_callback`, `event_timeout` de 1000 ms y un respaldo de 1200 ms por si GA4 no responde (por ejemplo, con un bloqueador de anuncios).

**Para ver `tipo_cliente` en los informes de GA4** debes registrarlo: **Administrar → Definiciones personalizadas → Crear dimensión personalizada**, con ámbito *Evento* (parámetro `tipo_cliente`) y/o ámbito *Usuario* (propiedad `tipo_cliente`). Tarda unas 24 horas en aparecer en informes; DebugView lo muestra enseguida.

## 5. Monitor de eventos

Panel fijo a la derecha (380 px; en pantallas de menos de 820 px pasa abajo con 300 px de alto). Muestra el estado de conexión, el **origen de la visita** (UTM de la primera página de la sesión), los últimos 12 eventos (con un desplegable "Ver parámetros") y el botón **Simular nuevo visitante**, que borra las cookies `_ga*`, el carrito y `sessionStorage` y vuelve al inicio. Se puede plegar con *Ocultar/Mostrar* y recuerda su estado.

Prueba de UTM: abre `index.html?utm_source=google&utm_medium=cpc&utm_campaign=navidad_2026`.

## 6. Recorrido de práctica sugerido

1. Abre el inicio con UTM → `page_view`, `view_item_list`, `view_promotion`.
2. Clic en el banner → `select_promotion` (cupón aplicado, llegas al carrito).
3. Vuelve al catálogo, abre un producto → `select_item`, `view_item`.
4. Agrega 2 unidades → `add_to_cart`. En el carrito: `view_cart`, aumenta y disminuye → `add_to_cart` y `remove_from_cart`.
5. Checkout → `begin_checkout`. Elige un país internacional y Express → `add_shipping_info`.
6. Elige un pago y pulsa "Pagar (simulado)" → `add_payment_info`, luego `purchase`.
7. Recarga `gracias.html`: no se envía un segundo `purchase`.

## 7. Subir a GitHub desde el navegador

1. Entra a <https://github.com/new>, ponle un nombre al repositorio (por ejemplo `cumbre-andina`), déjalo **Public** y pulsa **Create repository**.
2. En la página del repositorio vacío, pulsa **uploading an existing file**.
3. **Descomprime el .zip** en tu computador y arrastra **el contenido** de la carpeta `cumbre-andina` (`index.html`, las demás páginas, `css/`, `js/` y `README.md`), no el .zip. `index.html` debe quedar en la **raíz** del repositorio.
4. Pulsa **Commit changes**.

## 8. Publicar en Vercel

1. Entra a <https://vercel.com>, inicia sesión con tu cuenta de GitHub y pulsa **Add New… → Project**.
2. Importa el repositorio (**Import**).
3. En **Framework Preset** elige **Other**. Deja vacíos *Build Command* y *Output Directory*, y *Root Directory* en `./`.
4. Pulsa **Deploy**. En menos de un minuto tendrás una URL `https://tu-proyecto.vercel.app`.
5. Para cambiar el ID de GA4: en GitHub abre `js/config.js` → lápiz (editar) → pega el ID → **Commit changes**. Vercel republica solo.

## 9. Problemas frecuentes

- **No veo eventos en GA4:** confirma que el ID empieza por `G-`, que `DEBUG_MODE` es `true` y que abres **DebugView**. Los bloqueadores de anuncios o de rastreo impiden que GA4 reciba datos (el monitor seguirá mostrando los eventos).
- **El monitor dice "Sin ID de medición":** el ID sigue siendo `G-XXXXXXXXXX` o tiene formato inválido.
- **Quiero empezar de cero:** botón **Simular nuevo visitante** del monitor.

---
*Sitio académico de simulación. No procesa pagos ni guarda datos personales. Usa Google Analytics 4.*
