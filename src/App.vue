<script setup lang="ts">
import { Network } from "@capacitor/network";
import { onBeforeMount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useOriginCoords } from "@/store/origin";
import { PageTransition } from "vue3-page-transition";
import { Toaster } from "vue-sonner";

const originStore = useOriginCoords();
const router = useRouter();
const route = useRoute();

onBeforeMount(async () => {
  Network.addListener("networkStatusChange", async (s) => {
    if (s.connected) {
      if (route.path === "/no-internet") {
        router.go(-1);
      }

      await originStore.getCoords(false);

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
  <div class="app">
    <div
      class="fixed bg-primary text-primary-foreground rounded px-2 text-sm opacity-50 bottom-5 left-[60%] right-[50%] w-full"
    >
      {{ route.fullPath }}
    </div>
    <Toaster :close-button="true" :toast-options="{ class: 'font-manrope' }" />
    <vue3-progress-bar></vue3-progress-bar>
    <router-view v-slot="{ Component }">
      <PageTransition name="fade-in-up" appear>
        <component :is="Component" />
      </PageTransition>
    </router-view>
  </div>
</template>

<style>
.vue3-progress-bar-container .vue3-progress-bar {
  background-color: #fcdc2a !important;
  height: 5px !important;
}
</style>
