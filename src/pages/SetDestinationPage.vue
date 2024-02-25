<script setup lang="ts">
import { useGeocoding } from "@/store/geocoding";
import { storeToRefs } from "pinia";
import { defineAsyncComponent, onMounted, watch } from "vue";
import { useMaps } from "@/store/maps";
import router from "@/router";
import { onBeforeRouteLeave } from "vue-router";
import { useOriginCoords } from "@/store/origin";
import { Flag, Check, ChevronLeft } from "lucide-vue-next";
import { useDestination } from "@/store/destination";
import { useLoading } from "@/store/loading";

const mapsStore = useMaps();
const originStore = useOriginCoords();
const geocodingStore = useGeocoding();
const destinationStore = useDestination();
const loadingStore = useLoading();

const { lat, lng } = storeToRefs(originStore);
const { sharedMap, defaultZoom } = storeToRefs(mapsStore);
const {
  lat: destinationLat,
  lng: destinationLng,
  coords: destinationCoords,
} = storeToRefs(destinationStore);
const { loading } = storeToRefs(loadingStore);
const { destinationAddress, notFound, errorMessage } =
  storeToRefs(geocodingStore);
const { mapMoving } = storeToRefs(mapsStore);

const Button = defineAsyncComponent(
  () => import("@/components/ui/button/Button.vue")
);

onMounted(async () => {
  await mapsStore.addDestinationMarker();
});

onMounted(async () => {
  await geocodingStore.geocoding(
    destinationLat.value,
    destinationLng.value,
    "destination"
  );
});

onBeforeRouteLeave(async (to, from, next) => {
  if (to.path === "/ride/setOrigin") {
    sharedMap.value?.setView([lat.value, lng.value], defaultZoom.value);
  }
  await mapsStore.addFixedDestinationMarker();

  return next();
});

watch(
  () => destinationCoords.value,
  async (newOne, oldOne) => {
    await geocodingStore.geocoding(newOne.lat, newOne.lng, "destination");
  },
  { deep: true }
);

const goBack = async () => {
  router.push("/ride/setOrigin");
};
</script>

<template>
  <div class="set-destination-page h-auto flex flex-col">
    <Button @click="goBack" class="mb-4 justify-self-end self-end mr-4"
      ><ChevronLeft class="w-4 h-4 mr-2" /> Orqaga</Button
    >
    <div
      class="main-content bg-primary-foreground text-foreground p-6 custom-style"
    >
      <h1 class="text-primary font-bold text-xl mb-4">Boradigan manzilingiz</h1>
      <p class="text-primary flex items-start font-semibold">
        <Flag class="w-[20px] h-[20px] mr-2"/>
        {{
          notFound
            ? errorMessage
            : loading || mapMoving
            ? "Aniqlanmoqda..."
            : destinationAddress?.name || destinationAddress?.displayName
        }}
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
