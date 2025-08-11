// PostCSS local (anula cualquier postcss.config.js en directorios superiores)
// No cargamos plugins aquí porque Tailwind v4 ya se integra vía @tailwindcss/vite
// y la hoja index.css usa `@import "tailwindcss";`

export default {
  plugins: {}
};
