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

      if (!oneId && !token && !confirmation) {
        return next({ path: "/auth/login" });
      }

      if (!oneId && !token && confirmation === "false") {
        return next({ path: "/auth/confirmation" });
      }

      if (confirmation === "true" && oneId && token) {
        return next();
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
      {
        path: "letsgo",
        name: "layout-home-lets-go",
        component: () => import("@/pages/LetsGoPage.vue"),
      },
    ],
  },
  {
    path: "/auth/",
    name: "auth-layout",
    component: () => import("@/layouts/Auth.vue"),
    redirect: "/auth/login",
    children: [
      {
        name: "auth-login",
        path: "login",
        component: () => import("@/pages/Auth/LoginPage.vue"),
        async beforeEnter(to, from, next) {
          const { value: confirmation } = await Preferences.get({
            key: "confirmation",
          });
          const { value: token } = await Preferences.get({ key: "auth_token" });
          const { value: oneId } = await Preferences.get({
            key: "clientOneId",
          });

          if (oneId && token && confirmation === "true") {
            return next({ path: "/ride/setOrigin" });
          }

          if (confirmation === "false") {
            return next({ path: "/auth/confirmation" });
          }

          return next();
        },
      },
      {
        name: "auth-confirmation",
        path: "confirmation",
        component: () => import("@/pages/Auth/ConfirmationPage.vue"),
        async beforeEnter(to, from, next) {
          const { value: confirmation } = await Preferences.get({
            key: "confirmation",
          });
          const { value: token } = await Preferences.get({ key: "auth_token" });
          const { value: oneId } = await Preferences.get({
            key: "clientOneId",
          });

          if (oneId && token && confirmation === "true") {
            return next({ path: "/ride/setOrigin" });
          }

          if (!confirmation && !oneId && !token) {
            return next({ path: "/auth/login" });
          }

          return next();
        },
      },
    ],
  },
  {
    path: "/options/",
    name: "options-layout",
    component: () => import("@/layouts/Options.vue"),
    async beforeEnter(to, from, next) {
      const { value: token } = await Preferences.get({ key: "auth_token" });
      const { value: oneId } = await Preferences.get({ key: "clientOneId" });
      const { value: confirmation } = await Preferences.get({
        key: "confirmation",
      });

      if (!oneId && !token && !confirmation) {
        return next({ path: "/auth/login" });
      }

      if (!oneId && !token && confirmation === "false") {
        return next({ path: "/auth/confirmation" });
      }

      if (confirmation === "true" && oneId && token) {
        return next();
      }

      return next();
    },
    children: [
      {
        path: "profile",
        name: "options-layout-profile-page",
        component: () => import("@/pages/Options/ProfilePage.vue"),
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
