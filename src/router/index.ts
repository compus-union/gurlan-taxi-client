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
      const { value: confirmation } = await Preferences.get({
        key: "confirmation",
      });

      if (
        (oneId === "undefined" &&
          token === "undefined" &&
          confirmation === "undefined") ||
        (!oneId && !token && !confirmation) ||
        (oneId === "null" && token === "null" && confirmation === "null") ||
        !oneId ||
        !token ||
        !confirmation ||
        (!oneId && !token && !confirmation)
      ) {
        await Preferences.remove({ key: "clientOneId" });
        await Preferences.remove({ key: "auth_token" });
        await Preferences.remove({ key: "confirmation" });

        return next("/auth");
      }

      return next();
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
    path: "/auth/",
    name: "auth-layout",
    component: () => import("@/layouts/Auth.vue"),
    redirect: "/auth/login",
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
        return next();
      }

      return next("/ride/setOrigin");
    },
    children: [
      {
        name: "auth-login",
        path: "login",
        component: () => import("@/pages/Auth/LoginPage.vue"),
      },
      {
        name: "auth-register",
        path: "register",
        component: () => import("@/pages/Auth/RegisterPage.vue"),
      },
      {
        name: "auth-confirmation",
        path: "confirmation",
        component: () => import("@/pages/Auth/ConfirmationPage.vue"),
        async beforeEnter(to, from, next) {
          const { value: confirmation } = await Preferences.get({
            key: "confirmation",
          });

          if (confirmation && confirmation === "false") {
            return next();
          }

          if (confirmation === "true") {
            return next("/ride/setOrigin");
          }

          if (!confirmation || confirmation === "undefined") {
            return next("/auth/login");
          }

          return next();
        },
      },
    ],
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
