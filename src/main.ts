import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { useTheme } from "./composables/useTheme";
import { setupAppErrorHandling } from "./utils/errorHandler";
import { registerSW } from "virtual:pwa-register";

useTheme();

const app = createApp(App);
setupAppErrorHandling(app);
app.mount("#app");

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    // Automatically update to latest version on page refresh
    // This provides a seamless experience without interrupting the user
    updateSW(true);
  },
  onOfflineReady() {
    console.log("App ready to work offline");
  },
});
