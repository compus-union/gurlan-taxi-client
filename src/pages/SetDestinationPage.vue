<script setup lang="ts">
import { useGeocoding } from "@/store/geocoding";
import { storeToRefs } from "pinia";
import { defineAsyncComponent, onMounted } from "vue";
import { useMaps } from "@/store/maps";
import router from "@/router";
import { onBeforeRouteLeave } from "vue-router";
import { useOriginCoords } from "@/store/origin";
import { Flag, Check } from "lucide-vue-next";

const mapsStore = useMaps();
const originStore = useOriginCoords();

const { lat, lng } = storeToRefs(originStore);
const { sharedMap, defaultZoom } = storeToRefs(mapsStore);

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
    sharedMap.value?.setView([lat.value, lng.value], defaultZoom.value);
  }
  await mapsStore.addFixedDestinationMarker();

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
      <h1 class="text-primary font-bold text-xl mb-4">Boradigan manzilingiz</h1>
      <p class="text-primary flex items-start">
        <Flag class="w-[20px] h-[20px] mr-2" /> Mustaqillik ko’ch. 55, Gurlan,
        Xorazm
      </p>
      <Button class="w-full mt-4"
        ><Check class="w-4 h-4 mr-2" /> Belgilash</Button
      >
    </div>
  </div>
</template>

<style scoped>
.custom-style {
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -8px 8px -2px rgba(0, 0, 0, 0.2);
}
</style>
