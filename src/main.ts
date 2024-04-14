import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { Vue3ProgressPlugin } from "@marcoschulte/vue3-progress";
import "@marcoschulte/vue3-progress/dist/index.css";
/* Theme variables */
import "./theme/variables.css";
import "./theme/base.css";
import "leaflet/dist/leaflet.css";

const app = createApp(App)
  .use(router)
  .use(createPinia())
  .use(Vue3ProgressPlugin);
router.isReady().then(() => {
  app.mount("#app");
});

