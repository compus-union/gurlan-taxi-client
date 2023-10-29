import { Preferences } from "@capacitor/preferences";
import { RouteRecordRaw, createRouter, createWebHistory } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "blank",
    redirect: "/ride/setOrigin",
  },
  {
    path: "/ride",
    name: "default-layout",
    redirect: "/ride/setOrigin",
    component: () => import("@/layouts/Default.vue"),
    async beforeEnter(to, from, next) {
      const { value: token } = await Preferences.get({ key: "auth_token" });
      const { value: oneId } = await Preferences.get({ key: "clientOneId" });

      if (
        (oneId === "undefined" && token === "undefined") ||
        (!oneId && !token) ||
        (oneId === "null" && token === "null") ||
        !oneId ||
        !token ||
        (!oneId && !token)
      ) {
        await Preferences.remove({ key: "clientOneId" });
        await Preferences.remove({ key: "auth_token" });

        return next("/register");
      }

      next();
    },
    children: [
      {
        path: "setOrigin",
        name: "layout-home-set-origin",
        component: () => import("@/pages/HomePage.vue"),
      },
      {
        path: "setDestination",
        name: "layout-home-set-destination",
        component: () => import("@/pages/SetDestinationPage.vue"),
      },
    ],
  },
  {
    path: "/register",
    name: "register-layout",
    component: () => import("@/layouts/Register.vue"),
    async beforeEnter(to, from, next) {
      const { value: token } = await Preferences.get({ key: "auth_token" });
      const { value: oneId } = await Preferences.get({ key: "clientOneId" });

      if (
        (oneId === "undefined" && token === "undefined") ||
        (!oneId && !token) ||
        (oneId === "null" && token === "null") ||
        !oneId ||
        !token ||
        (!oneId && !token)
      ) {
         next();
      }

      return next("/register");
    },
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
