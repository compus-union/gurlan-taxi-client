<script setup lang="ts">
import { useGeocoding } from "@/store/geocoding";
import { useMaps } from "@/store/maps";
import { useLoading } from "@/store/loading";
import { useOriginCoords } from "@/store/origin";
import { storeToRefs } from "pinia";
import { toRefs, watch } from "vue";
import { useDestination } from "@/store/destination";
import { Flag, Locate } from "lucide-vue-next";

type ComponentType = "origin" | "destination";

const props = defineProps<{
  componentType: ComponentType;
}>();

const { componentType } = toRefs(props);

const geocodingStore = useGeocoding();
const mapsStore = useMaps();
const loadingStore = useLoading();
const originStore = useOriginCoords();
const destinationStore = useDestination();

const { originAddress, notFound, errorMessage, destinationAddress } =
  storeToRefs(geocodingStore);
const { mapMoving } = storeToRefs(mapsStore);
const { loading } = storeToRefs(loadingStore);
const { coords: originCoords } = storeToRefs(originStore);
const { coords: destinationCoords } = storeToRefs(destinationStore);

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
const debouncedGeocoding = geocodingDebounce(async (newOne: any, component: ComponentType) => {
  await geocodingStore.geocoding(newOne.lat, newOne.lng, component);
}, 800);

watch(
  () => [originCoords.value, mapMoving.value, destinationCoords.value],
  async (newOne: any, oldOne) => {
    if (newOne[1]) return;
    if (newOne[0].lat !== oldOne[0].lat && newOne[0].lng !== oldOne[0].lng) {
      await loadingStore.setLoading(true);
      await debouncedGeocoding(newOne[0], "origin");
    }

    if (newOne[2].lat !== oldOne[2].lat && newOne[2].lng !== oldOne[2].lng) {
      await loadingStore.setLoading(true);
      await debouncedGeocoding(newOne[2], "destination");
    }
  },
  { immediate: true }
);
</script>

<template>
  <p
    v-if="componentType === 'origin'"
    class="font-manrope w-full flex items-center font-semibold text-lg overflow-hidden whitespace-nowrap text-ellipsis"
  >
    <Locate class="mr-2" :size="18" />
    {{
      notFound
        ? errorMessage
        : loading || mapMoving
        ? "Manzilingiz aniqlanmoqda..."
        : originAddress?.name || originAddress?.displayName
        ? originAddress?.name || originAddress?.displayName
        : "Manzilingiz"
    }}
  </p>
  <p
    v-if="componentType === 'destination'"
    class="font-manrope w-full flex items-center font-semibold text-lg overflow-hidden whitespace-nowrap text-ellipsis"
  >
    <Flag class="mr-2" :size="18" />
    {{
      notFound
        ? errorMessage
        : loading || mapMoving
        ? "Borish manzilingiz aniqlanmoqda..."
        : destinationAddress?.name || destinationAddress?.displayName
        ? destinationAddress?.name || destinationAddress?.displayName
        : "Borish manzilingiz"
    }}
  </p>
</template>
