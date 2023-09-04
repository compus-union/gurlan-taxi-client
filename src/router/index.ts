import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";

console.log(process.env.NODE_ENV);

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "blank",
    redirect: "/ride",
  },
  {
    path: "/ride",
    name: "default-layout",
    redirect: "/ride/setDestination",
  },
  {
    path: "/ride/setDestination",
    name: "layout-home-set-destination",
    component: () => import("@/pages/HomePage.vue"),
  },
  {
    path: "/register",
    name: "register-layout",
    component: () => import("@/layouts/Register.vue"),
  },
  {
    path: "/no-internet",
    name: "no-internet",
    component: () => import("@/pages/NoInternetPage.vue"),
  },
  {
    path: "/no-gps",
    name: "no-gps",
    component: () => import("@/pages/NoGPSPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
