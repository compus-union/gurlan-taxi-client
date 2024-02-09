<script setup lang="ts">
import { useGeocoding } from "@/store/geocoding";
import { useMaps } from "@/store/maps";
import { useLoading } from "@/store/loading";
import { useOriginCoords } from "@/store/origin";
import { storeToRefs } from "pinia";
import { onMounted, watch } from "vue";

type ComponentType = "origin" | "destination";

const props = defineProps<{
  componentType: ComponentType;
}>();

const geocodingStore = useGeocoding();
const mapsStore = useMaps();
const loadingStore = useLoading();
const originStore = useOriginCoords();

const { destinationAddress, originAddress, notFound, errorMessage } =
  storeToRefs(geocodingStore);
const { sharedMap, markers, mapMoving } = storeToRefs(mapsStore);
const { loading } = storeToRefs(loadingStore);
const { lat, lng, coords: originCoords } = storeToRefs(originStore);

onMounted(async () => {
  if (props.componentType === "origin") await originStore.getCoords();
  await geocodingStore.geocoding(lat.value, lng.value, props.componentType);
});

watch(
  () => originCoords.value,
  async (newOne, oldOne) => {
    await geocodingStore.geocoding(newOne.lat, newOne.lng, props.componentType);
  }
);
</script>

<template>
  <div
    class="reverse-geocoding fixed top-20 w-full flex items-center justify-center text-center"
  >
    <div class="content drop-shadow-lg font-semibold text-primary">
      <p>Sizning manzilingiz:</p>
      <h3 v-if="props.componentType === 'origin'" class="text-lg font-bold">
        {{
          notFound
            ? errorMessage
            : loading || mapMoving
            ? "Aniqlanmoqda..."
            : originAddress?.name || originAddress?.displayName
        }}
      </h3>
    </div>
  </div>
</template>
