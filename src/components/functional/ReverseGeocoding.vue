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

const { originAddress, notFound, errorMessage } = storeToRefs(geocodingStore);
const { mapMoving } = storeToRefs(mapsStore);
const { loading } = storeToRefs(loadingStore);
const { lat, lng, coords: originCoords } = storeToRefs(originStore);

onMounted(async () => {
  if (props.componentType === "origin") await originStore.getCoords();
  await geocodingStore.geocoding(lat.value, lng.value, props.componentType);
});

function geocodingDebounce(func: Function, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null;

  return async function (this: any, ...args: any[]) {
    const context = this;

    const later = function () {
      timeout = null;
      func.apply(context, args);
    };

    clearTimeout(timeout as ReturnType<typeof setTimeout>);
    timeout = setTimeout(later, wait);
  };
}

// Inside your component setup
const debouncedGeocoding = geocodingDebounce(
  async (newOne: any, oldOne: any) => {
    await geocodingStore.geocoding(
      newOne[0].lat,
      newOne[0].lng,
      props.componentType
    );
  },
  800
);

watch(
  () => [originCoords.value, mapMoving.value],
  async (newOne, oldOne) => {
    await loadingStore.setLoading(true);
    await debouncedGeocoding(newOne);
  },
  {
    deep: true,
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
