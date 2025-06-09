# ⚡ Comparador de Pokémon GO ⚡

Una aplicación web moderna y responsiva para analizar y comparar el DPS (Daño por Segundo) de tus Pokémon favoritos en Pokémon GO, ahora con datos en tiempo real de **PoGoAPI.net**.

## 🌟 Características Principales

### 🎯 Funcionalidades Core
- **Datos en tiempo real** desde PoGoAPI.net con fallback local
- **Cálculo preciso de DPS** basado en estadísticas oficiales del juego
- **Comparación visual** con gráficos interactivos de Chart.js
- **Nomenclatura única** para diferenciar Pokémon duplicados (ej: "Charizard #2")
- **Ordenamiento automático** por DPS de mayor a menor
- **Análisis de daño total** en ventanas de 10 segundos
- **Cache inteligente** para optimizar el rendimiento
- **Actualización manual** de datos desde la API

### 🌐 Integración con PoGoAPI
- **Datos actualizados** directamente desde la base de datos oficial
- **Múltiples endpoints** para estadísticas, movimientos y tipos
- **Sistema de fallback** a datos locales en caso de error
- **Transformación automática** de datos API al formato de la aplicación
- **Cache con expiración** para reducir llamadas innecesarias

### 🎨 Diseño y UX
- **Material-UI** con tema oscuro personalizado
- **Completamente responsivo** - se adapta a móviles, tablets y desktop
- **Animaciones suaves** y efectos hover
- **Gradients y efectos glassmorphism** para un look moderno
- **Notificaciones elegantes** para feedback del usuario
- **Estados de carga** con indicadores visuales
- **Estados vacíos informativos** con iconografía clara

### 📊 Visualización de Datos
- **Gráfico de barras dual** mostrando DPS y daño total
- **Tabla responsiva** con información detallada
- **Tooltips informativos** con datos adicionales
- **Adaptación automática** para diferentes tamaños de pantalla

### 🎨 Características Visuales Avanzadas
- **Colores por tipo**: Pokémon y movimientos con colores basados en sus tipos oficiales
- **Gradientes duales**: Para Pokémon con dos tipos (ej: Steel/Dragon para Dialga)
- **Iconos de tipo**: Cada movimiento muestra su icono de tipo correspondiente
- **Badges informativos**: Movimientos con poder, duración y costo de energía visible
- **Tooltips detallados**: Información completa de stats, tipos y movimientos en gráficos
- **Indicador STAB**: Marca visual cuando hay bonus de mismo tipo (+20% daño)
- **TypeChips**: Componentes reutilizables para mostrar tipos con diseño consistente
- **Fondos adaptativos**: Filas de tabla con colores de tipo para mejor legibilidad

### 🛠️ Tecnologías Utilizadas
- **React 18** con Hooks
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
