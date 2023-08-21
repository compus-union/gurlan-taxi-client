<script setup lang="ts">
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import { Network } from "@capacitor/network";
import { onBeforeMount, onMounted, ref } from "vue";
import { useMaps } from "./store/maps";
import { useRoute, useRouter } from "vue-router";
import { useCoords } from "@/store/coords";

const mapsStore = useMaps();
const coordsStore = useCoords();
const router = useRouter();
const route = useRoute();

onBeforeMount(async () => {
  Network.addListener("networkStatusChange", async (s) => {
    if (s.connected) {
      if (route.path === "/no-internet") {
        router.go(-1);
      }

      await coordsStore.getCoords();

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

      await coordsStore.getCoords();

      return;
    }

    router.push("/no-internet");
  };

  await logCurrentNetworkStatus();
});

const map = ref();

onMounted(async () => {
  
});
</script>

<template>
  <ion-app>
    <ion-router-outlet id="main-content"></ion-router-outlet>
  </ion-app>
</template>

<style scoped></style>
