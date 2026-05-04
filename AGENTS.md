# Reglas del Agente — AprendeX86

## Proyecto: PWA Terminal Linux para móviles (sin backend, v86 + GitHub Pages)

### Objetivo
Single Page Application (PWA) estática, alojable en GitHub Pages, que incrusta un terminal real de Linux corriendo completamente en el navegador mediante el emulador x86 **v86** (WebAssembly). Responsive, usable en móviles, funciona offline tras la primera carga e instalable como app nativa.

### Stack técnico
- **Sin backend**: todo se ejecuta en el cliente (HTML/CSS/JS + WebAssembly).
- **Emulador**: v86 (`libv86.js` + `v86.wasm`) descargado desde `https://copy.sh/v86/build/`.
- **BIOS**: `seabios.bin` y `vgabios.bin` desde `https://copy.sh/v86/bios/`.
- **Sistema operativo**: Buildroot Linux (`buildroot-bzimage.bin`, ~5 MB), un bzImage con kernel + initramfs integrado. Arranca con `cmdline: "console=ttyS0"` para salida serial.
- **Terminal**: xterm.js (`@xterm/xterm` v6) como renderizador del terminal serial (`serial_container_xtermjs`).
- **Clase del emulador**: `new V86({...})` (no `V86Starter`, que era la API antigua).
- **PWA**: Service Worker (`sw.js`) con estrategia cache-first + `manifest.json` para instalación.
- **Gestor de paquetes**: PNPM.
- **Alojamiento**: GitHub Pages, rama `main`.

### Estructura actual del proyecto
```
mipwa-terminal/
├── package.json          // scripts pnpm (dev server con serve)
├── pnpm-lock.yaml
├── index.html            // entrada principal
├── manifest.json         // manifest PWA (standalone, tema oscuro)
├── sw.js                 // service worker (cache-first)
├── styles.css            // estilos responsive, overlay de carga, toolbar
├── download-v86.sh       // script bash para descargar binarios de v86
├── node_modules/         // dependencia: @xterm/xterm
├── lib/
│   ├── v86.js            // libv86.js desde copy.sh (330 KB)
│   ├── v86.wasm          // WebAssembly del emulador (1.4 MB)
│   ├── seabios.bin       // BIOS (128 KB)
│   ├── vgabios.bin       // VGA BIOS (36 KB)
│   ├── xterm.js          // xterm.js copiado de node_modules
│   └── xterm.css         // estilos de xterm.js
└── assets/
    ├── buildroot-bzimage.bin   // kernel Linux + initramfs (5 MB)
    ├── icon-192x192.png        // ícono PWA
    └── icon-512x512.png        // ícono PWA
```

### Configuración del emulador (en index.html)
```js
const emulator = new V86({
    wasm_path: "lib/v86.wasm",
    bios: { url: "lib/seabios.bin" },
    vga_bios: { url: "lib/vgabios.bin" },
    memory_size: 128 * 1024 * 1024,
    bzimage: { url: "assets/buildroot-bzimage.bin" },
    cmdline: "console=ttyS0",
    disable_keyboard: false,
    disable_mouse: true,
    network_adapter: null,
    serial_container_xtermjs: document.getElementById("screen"),
    autostart: true
});
```

### Funcionalidades implementadas
- **Barra de herramientas móvil** (`#toolbar`): botones para Ctrl+C (`\x03`), Esc (`\x1b`), Tab (`\t`), `/`, `-`, `|`, `~`, ↑ (`\x1b[A`), ↓ (`\x1b[B`).
- **Panel de lecciones** (visible en ≥768px): botones que envían comandos de ejemplo al terminal.
- **Overlay de carga**: spinner "Iniciando Linux..." que se oculta al recibir primer byte serial.
- **Meta viewport**: `interactive-widget=resizes-content` para teclados virtuales.
- **Diseño**: `100dvh`, flexbox columna, tema oscuro.

### Convenciones importantes
- Los archivos de `lib/` (xterm.js, xterm.css) son copias estáticas de `node_modules` para que `serve` los sirva directamente. Si se actualiza `@xterm/xterm`, hay que volver a copiarlos.
- Las URLs de descarga oficiales de v86 son de `copy.sh`, NO de `unpkg` (unpkg devuelve 404 para los builds).
- El Service Worker cachea todos los recursos en `sw.js`. Si se agregan archivos nuevos, actualizar el array `ASSETS` y el `CACHE_NAME`.

### Cómo ejecutar en desarrollo
```bash
cd mipwa-terminal
pnpm start   # levanta serve en localhost:3000
```
