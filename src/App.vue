<script setup lang="ts">
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import { Network } from "@capacitor/network";
import { onBeforeMount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useOriginCoords } from "@/store/origin";

const originStore = useOriginCoords();
const router = useRouter();
const route = useRoute();

onBeforeMount(async () => {
  Network.addListener("networkStatusChange", async (s) => {
    if (s.connected) {
      if (route.path === "/no-internet") {
        router.go(-1);
      }

      await originStore.getCoords();

      return;
    }

    router.push("/no-internet");
  });

  const logCurrentNetworkStatus = async () => {
    const status = await Network.getStatus();

    if (status.connected) {
      if (route.path === "/no-internet") {
        router.go(-1);
      }

      await originStore.getCoords();

      return;
    }

    router.push("/no-internet");
  };

  await logCurrentNetworkStatus();
});
</script>

<template>
  <ion-app>
    <ion-router-outlet id="main-content"></ion-router-outlet>
  </ion-app>
</template>

<style scoped></style>