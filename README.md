# [🌴 Mono](https://mono-bjiz.onrender.com/)

En este juego, la mayoría de los jugadores son **Civiles** que conocen una palabra secreta, pero uno o más jugadores son **Monos** que no la conocen. El objetivo de los Civiles es identificar a los Monos, mientras que los Monos deben camuflarse y tratar de descubrir la palabra secreta a través de las pistas de los demás.

---

## 🎮 Cómo Jugar

### Roles

- **Civiles**: Conocen la palabra secreta y deben identificar a los Monos
- **Monos**: No conocen la palabra y deben camuflarse mientras intentan descubrirla

### Reglas del Juego

1. **Inicio**: Todos los jugadores reciben una **Palabra Secreta**, excepto los **Monos**
2. **Pistas**: Por turnos, cada jugador da una pista relacionada con la palabra
3. **Estrategia del Mono**: Los Monos deben dar pistas convincentes sin delatar que no saben la palabra
4. **Votación**: Después de las pistas, todos votan por quién creen que es el Mono
5. **Resultados**:
   - **Monos no atrapados**: Ganan automáticamente
   - **Monos atrapados**: Pueden adivinar la palabra para ganar
   - **Civiles ganan**: Solo si atrapan a todos los Monos y ninguno adivina la palabra

---

## ✨ Características

### 🌐 Modos de Juego

- desde 3 jugadores

#### **Offline (Local)**
- Juega en un solo dispositivo pasándolo entre jugadores

#### **Online - En Persona**
- Todos los jugadores en la misma sala física
- Cada uno usa su propio dispositivo
- Las pistas se muestran a todos simultáneamente

#### **Online - Por Chat**
- Las pistas se escriben en un chat
- Votación multi-selección

### 🎨 Temas Personalizados

#### **Temas Integrados**
- **Básico**: Palabras cotidianas
- **Películas**: Títulos y personajes famosos
- **Comida**: Platos y alimentos
- **Animales**: Fauna diversa
- **Deportes**: Actividades deportivas
- **Música**: Géneros y artistas
- **Lugares**: Países y ciudades
- **Profesiones**: Oficios y trabajos
- etc...

#### **Listas Personalizadas**
- Crear listas de palabras
- Guardar múltiples listas localmente
- Editar y eliminar listas
- Combina múltiples temas en una partida

#### **Temas Contribuidos por Jugadores** 🆕
- Cualquier jugador puede compartir sus temas con la sala
- Los temas contribuidos muestran el nombre del creador
- El anfitrión selecciona qué temas usar en la partida

### 👥 Configuración Flexible

#### **Jugadores**
- **Modo Ilimitado**: Acepta cualquier cantidad de jugadores (por defecto)
- **Modo Limitado**: Establece un límite específico de jugadores

#### **Monos**
- Configura de 1 a `(ceiling(jugadores/2) - 1)` Monos

### 🎯 Validación Inteligente de Palabras

El juego acepta variaciones de la palabra secreta:
- **Insensible a mayúsculas/minúsculas**: "PERRO" = "perro"
- **Ignora acentos**: "café" = "cafe"
- **Tolerancia de errores tipográficos**: Acepta palabras con pequeños errores tipográficos

### 🔐 Salas Privadas Online - to do

- Crea salas con códigos de 4 letras únicos
- Solo quienes tengan el código pueden unirse
- Las salas se cierran automáticamente cuando el anfitrión sale
- Reconexión automática si pierdes la conexión

---

## 🚀 Instalación

### Requisitos

- [Node.js](https://nodejs.org/) instalado (v16 o superior)

### Pasos para empezar

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/gabrielfranicevich/monofied.git
   cd monofied
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Modo Desarrollo**:
   ```bash
   npm run dev
   ```
   El servidor de desarrollo iniciará en `http://localhost:5173`

4. **Modo Producción**:
   ```bash
   npm run build
   npm run start
   ```
   El servidor de producción correrá en el puerto `3000`

---

## 🌐 Jugar Online

Visita [mono-bjiz.onrender.com](https://mono-bjiz.onrender.com/) para jugar directamente sin instalar nada.

