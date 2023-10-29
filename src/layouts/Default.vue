<script setup lang="ts">
import { Preferences } from "@capacitor/preferences";
import { onBeforeRouteUpdate, useRouter } from "vue-router";
import { onBeforeMount } from "vue";
import { useMaps } from "@/store/maps";
import { useAuth } from "@/store/auth";
import { ResponseStatus } from "@/constants";

const router = useRouter();
const mapsStore = useMaps();
const authStore = useAuth();

onBeforeMount(async () => {
  const check = await authStore.check();

  if (check?.status !== ResponseStatus.CLIENT_CHECK_DONE) {
    router.push("/register");
    return;
  }

  return;
});

onBeforeMount(async () => {
  // set loading

  try {
    // show loading
    await mapsStore.loadMap("map");
  } catch (error: any) {
    // show error with toast
  } finally {
    // dismiss loading
  }
});

onBeforeRouteUpdate(async (to, from, next) => {
  // set loading

  try {
    // show loading

    await mapsStore.loadMap("map");
  } catch (error: any) {
    // show error with toast
  } finally {
    setTimeout(async () => {
      next();
      // dismiss loading
    }, 2000);
  }

  return next();
});

const logout = async () => {
  await Preferences.remove({ key: "auth_token" });
  await Preferences.remove({ key: "clientOneId" });

  await router.push("/register");
};
</script>

<template></template>

<style scoped>
img[alt="Google"] {
  display: none;
}

div.gmnoprint {
  display: none;
}
</style>
