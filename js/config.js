/* ==========================================================================
   CONFIGURACIÓN DE LA TIENDA  ·  Este es el ÚNICO archivo que debes editar.
   ==========================================================================

   1) GA_MEASUREMENT_ID
      Pega aquí tu ID de medición de Google Analytics 4 (empieza por "G-").
      Dónde encontrarlo: GA4 → Administrar (engranaje) → Flujos de datos →
      tu flujo web → "ID de medición".
      Mientras el valor sea "G-XXXXXXXXXX" NO se carga Google Analytics y los
      eventos solo se muestran en el monitor de la derecha.

   2) DEBUG_MODE
      true  → los eventos aparecen en GA4 → Administrar → DebugView (ideal
              para clase y pruebas).
      false → modo normal: los eventos NO van a DebugView.
*/
window.TIENDA_CONFIG = {
  GA_MEASUREMENT_ID: "G-XXXXXXXXXX", // ← pega aquí tu ID, entre comillas
  DEBUG_MODE: true                   // ← true para DebugView, false para producción
};
