<script setup lang="ts">
import { Network } from "@capacitor/network";
import { onBeforeMount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useOriginCoords } from "@/store/origin";
import { debounce } from "@/utils/debounce";

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

const isDarkMode = ref(false);

const checkDarkMode = () => {
  isDarkMode.value = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (isDarkMode.value) {
    if (!document.querySelector("body")?.classList.contains("dark")) {
      document.querySelector("body")?.classList.add("dark");
    }
    return;
  }

  if (!isDarkMode.value) {
    if (document.querySelector("body")?.classList.contains("dark")) {
      document.querySelector("body")?.classList.remove("dark");
    }
    return;
  }
};

onMounted(() => {
  checkDarkMode();

  const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const debouncedCheckDarkMode = debounce(checkDarkMode, 100);

  darkModeMediaQuery.addEventListener("change", debouncedCheckDarkMode);
});
</script>

<template>
  <div class="app">
    <div
      class="fixed bg-primary text-primary-foreground rounded px-2 text-sm opacity-50 bottom-5 left-[60%] right-[50%] w-full"
    >
      {{ route.fullPath }}
    </div>
    <router-view></router-view>
  </div>
</template>

<style scoped></style>
