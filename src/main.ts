import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { useTheme } from "./composables/useTheme";
import { setupAppErrorHandling } from "./utils/errorHandler";

useTheme();

const app = createApp(App);
setupAppErrorHandling(app);
app.mount("#app");
