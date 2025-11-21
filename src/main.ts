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
    // Show a prompt to the user asking if they want to reload
    if (confirm("New content available. Reload to update?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App ready to work offline");
  },
});
