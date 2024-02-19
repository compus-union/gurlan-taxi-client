<script setup lang="ts">
import { useGeocoding } from "@/store/geocoding";
import { storeToRefs } from "pinia";
import { defineAsyncComponent, onBeforeUnmount, onMounted } from "vue";
import { useMaps } from "@/store/maps";
import router from "@/router";
import { onBeforeRouteLeave } from "vue-router";

const mapsStore = useMaps();

const Button = defineAsyncComponent(
  () => import("@/components/ui/button/Button.vue")
);

const geocodingStore = useGeocoding();

const { originAddress } = storeToRefs(geocodingStore);

onMounted(async () => {
  await mapsStore.addDestinationMarker();
});

onBeforeRouteLeave(async (to, from, next) => {
  if (to.path === "/ride/setOrigin") {
    await mapsStore.removeDestinationMarker();
  }

  if (to.path === "/ride/letsgo") {
    await mapsStore.addFixedDestinationMarker();
  }

  return next();
});

const goBack = async () => {
  router.push("/ride/setOrigin");
};
</script>

<template>
  <div class="set-destination-page h-auto flex flex-col">
    <div
      class="main-content bg-primary-foreground text-foreground p-6 custom-style"
    >
      <h1 class="text-primary">
        {{ originAddress?.displayName || originAddress?.name }}
      </h1>
      <Button @click="goBack">Go back</Button>
    </div>
  </div>
</template>
