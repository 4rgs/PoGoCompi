# ⚡ Comparador de Pokémon GO ⚡

Una aplicación web moderna para analizar y comparar el DPS de tus Pokémon favoritos en Pokémon GO.

## � Características

- 📊 **Análisis de DPS** con datos en tiempo real
- 📱 **PWA completa** - instalable como app nativa
- 🎨 **Interfaz moderna** con tema oscuro
- 📈 **Gráficos interactivos** para visualizar comparaciones
- 🔄 **Auto-actualización** con Watchtower
- 💾 **Funcionamiento offline** una vez cacheado

## 🚀 Instalación Rápida

### Instalación automática (recomendado)

```bash
curl -sSL https://raw.githubusercontent.com/4rgs/PoGoCompi/main/install.sh | bash
```

### CasaOS / Docker Compose

```bash
# Clonar y ejecutar
git clone https://github.com/4rgs/PoGoCompi.git
cd PoGoCompi
docker-compose up -d
```

### CasaOS App Store

1. Abrir CasaOS → Apps → Custom Install
2. Pegar URL: `https://raw.githubusercontent.com/4rgs/PoGoCompi/main/docker-compose.yml`
3. Instalar

### Acceso

- **URL**: `http://tu-ip:3001`
- **PWA**: Instala desde el navegador para mejor experiencia

## 🔧 Tecnologías

- React 18 + Vite
- Material-UI + Chart.js
- Docker + Auto-actualización
- PWA con Service Worker

## 📱 PWA

La aplicación se puede instalar como PWA desde cualquier navegador moderno:
- Chrome/Edge: Ícono de instalación en barra de direcciones
- Firefox: Menú → Instalar aplicación
- Safari iOS: Compartir → Añadir a pantalla de inicio

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Por favor abre un issue o pull request.

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles.
- **Material-UI (MUI)** para componentes y theming
- **Chart.js** con react-chartjs-2 para visualizaciones
- **PoGoAPI.net** para datos en tiempo real
- **Vite** para desarrollo y build optimizado
- **CSS-in-JS** con emotion para estilos avanzados

## 🚀 Instalación y Uso

```bash
# Clonar el repositorio
git clone [url-del-repo]

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build
```

## 🌐 Fuente de Datos

La aplicación utiliza **PoGoAPI.net** como fuente principal de datos:

- **Estadísticas de Pokémon**: `/api/v1/pokemon_stats.json`
- **Movimientos actuales**: `/api/v1/current_pokemon_moves.json`
- **Movimientos rápidos**: `/api/v1/fast_moves.json`
- **Movimientos cargados**: `/api/v1/charged_moves.json`
- **Tipos de Pokémon**: `/api/v1/pokemon_types.json`

### 🔄 Sistema de Fallback
Si la API no está disponible, la aplicación utiliza datos locales almacenados en `src/data/pokemon_data.json`.

### 📦 Cache Inteligente
- **Duración**: 1 hora por defecto
- **Actualización manual**: Botón "Actualizar" en el formulario
- **Cache persistente**: Mantiene datos durante la sesión

## 📱 Características Responsivas

### 📋 Móviles (< 600px)
- Formulario de una columna
- Tabla con scroll horizontal
- Gráfico optimizado con labels truncados
- Botones de ancho completo

### 💻 Tablets (600px - 960px)
- Formulario de dos columnas
- Tabla con columnas selectivas
- Gráfico con mejor legibilidad

### 🖥️ Desktop (> 960px)
- Layout completo con todas las columnas
- Gráfico de tamaño óptimo
- Mejor aprovechamiento del espacio

## 🎮 Cómo Usar

1. **Selecciona un Pokémon** del dropdown
2. **Configura nivel e IV de ataque** (1-50 y 0-15 respectivamente)
3. **Elige movimientos** rápido y cargado
4. **Haz clic en "Agregar Pokémon"**
5. **Compara resultados** en la tabla y gráfico
6. **Limpia la lista** cuando quieras empezar de nuevo

## 📈 Métricas Calculadas

- **DPS**: Daño por segundo efectivo
- **Ataque Total**: Ataque base + IV + bonus por nivel
- **STAB**: Same Type Attack Bonus aplicado automáticamente
- **Daño Total (10s)**: Proyección de daño acumulado

## 🔧 Personalización

El tema se puede personalizar fácilmente modificando los colores en `src/App.jsx`:

```javascript
const theme = createTheme({
  palette: {
    primary: { main: '#3b82f6' }, // Azul principal
    secondary: { main: '#10b981' }, // Verde secundario
    // ... más opciones
  }
});
```

---

Desarrollado con ❤️ para la comunidad de Pokémon GO+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
