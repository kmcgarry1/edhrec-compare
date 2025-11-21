import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { useTheme } from "./composables/useTheme";
import { setupAppErrorHandling } from "./utils/errorHandler";
import { initSentry } from "./utils/sentry";

useTheme();

const app = createApp(App);

// Initialize Sentry for production error tracking
initSentry(app);

setupAppErrorHandling(app);
app.mount("#app");
