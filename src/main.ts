import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { useTheme } from "./composables/useTheme";
import { setupAppErrorHandling } from "./utils/errorHandler";
import { initSentry } from "./utils/sentry";
import router from "./router";

useTheme();

const app = createApp(App);

app.use(router);

// Initialize Sentry for production error tracking
initSentry(app);

setupAppErrorHandling(app);
app.mount("#app");
