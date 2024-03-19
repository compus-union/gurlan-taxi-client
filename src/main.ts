import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import Vue3Toasity, { toast, type ToastContainerOptions } from "vue3-toastify";

/* Theme variables */
import "./theme/variables.css";
import "./theme/base.css";
import "leaflet/dist/leaflet.css";
import "vue3-toastify/dist/index.css";

const app = createApp(App)
  .use(Vue3Toasity, {
    autoClose: 4000,
    hideProgressBar: true,
    position: toast.POSITION.BOTTOM_CENTER,
    closeButton: false,
    theme: "dark",
    closeOnClick: true,
  } as ToastContainerOptions)
  .use(router)
  .use(createPinia())

router.isReady().then(() => {
  app.mount("#app");
});
