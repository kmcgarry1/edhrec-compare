import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { useTheme } from "./composables/useTheme";

useTheme();

if (import.meta.env.PROD) {
  import("@vercel/analytics")
    .then(({ inject }) => inject())
    .catch((error) => {
      console.error("Failed to initialize Vercel Analytics", error);
    });
}

createApp(App).mount("#app");
