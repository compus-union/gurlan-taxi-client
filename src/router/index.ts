import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "default-layout",
    component: () => import("@/layouts/Default.vue"),
  },
  {
    path: "/register",
    name: "register-layout",
    component: () => import("@/layouts/Register.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
