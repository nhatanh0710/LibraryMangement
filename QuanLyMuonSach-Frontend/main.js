import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./src/router";
import App from "./App.vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@/styles/styles.css"; // styles global của bạn
import "@/styles/layout.css";
const app = createApp(App);
app.use(createPinia());
app.use(router);

app.mount("#app");
