# 🌴 Mono

En este juego, la mayoría de los jugadores son **Civiles** que conocen una palabra secreta, pero uno o más jugadores son **Monos** que no la conocen. El objetivo de los Civiles es identificar a los Monos, mientras que los Monos deben camuflarse y tratar de descubrir la palabra secreta a través de las pistas de los demás.

---

## 🎮 Reglas del Juego

1. **Inicio**: Todos los jugadores reciben una **Palabra Secreta**, excepto los **Monos**, que no saben cuál es.
2. **Pistas**: Por turnos, cada jugador da una pista relacionada con la palabra secreta.
3. **Estrategia del Mono**: Los Monos deben dar pistas que no los delaten, intentando deducir la palabra de las pistas de los civiles para pasar desapercibidos.
4. **Votación**: Después de la ronda de pistas, todos los jugadores votan por quién creen que es el Mono.
5. **Resultados de la Votación**:
   - **Los monos que no sean atrapados**: **ganan automáticamente**.
   - **Los Monos atrapados**: entran en la fase de "Adivinar Palabra".
6. **Adivinar Palabra**: Los Monos atrapados tienen una última oportunidad. Deben intentar adivinar la palabra secreta.
   - **Los monos que adivinen la palabra**: **ganan la partida también**.
7. **Solamente si todos los monos son atrapados y no adivinan la palabra**: Los **Civiles ganan la partida**.

---

## 🚀 Instalación

### Requisitos

- [Node.js](https://nodejs.org/) instalado.

### Pasos para empezar

1. **Clonar el repositorio y entrar en la carpeta**:
   ```bash
   git clone https://github.com/gabrielfranicevich/monofied.git
   cd monofied
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar en modo Desarrollo**:
   Para trabajar en el código y ver los cambios en tiempo real:
   ```bash
   npm run build
   npm run dev
   ```
   *Esto iniciará el servidor de desarrollo de Vite (usualmente en `http://localhost:5173`).*

4. **Ejecutar en modo Producción**:
   Para una experiencia optimizada y lista para jugar:
   ```bash
   # 1. Construir la aplicación frontend
   npm run build

   # 2. Iniciar el servidor backend
   npm run start
   ```
   *El servidor correrá en el puerto `3000` (o el definido en el entorno) y servirá la aplicación desde la carpeta `dist/`.*

---
