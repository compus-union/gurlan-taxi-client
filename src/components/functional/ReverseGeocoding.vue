<script setup lang="ts">
import { useGeocoding } from "@/store/geocoding";
import { useMaps } from "@/store/maps";
import { useLoading } from "@/store/loading";
import { useOriginCoords } from "@/store/origin";
import { storeToRefs } from "pinia";
import { computed, watch } from "vue";
import { ChevronRight } from "lucide-vue-next";

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
const { coords: originCoords } = storeToRefs(originStore);

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
const debouncedGeocoding = geocodingDebounce(async (newOne: any) => {
  await geocodingStore.geocoding(newOne.lat, newOne.lng, props.componentType);
}, 800);

watch(
  () => [originCoords.value, mapMoving.value],
  async (newOne: any, oldOne) => {
    if (!newOne[1]) {
      await loadingStore.setLoading(true);
      await debouncedGeocoding(newOne[0]);
    }
  },
  { immediate: true }
);
</script>

<template>
  <p
    v-if="props.componentType === 'origin'"
    class="font-manrope w-full font-semibold text-sm overflow-hidden whitespace-nowrap text-ellipsis"
  >
    {{
      notFound
        ? errorMessage
        : loading || mapMoving
        ? "Aniqlanmoqda..."
        : originAddress?.name || originAddress?.displayName
        ? originAddress?.name || originAddress?.displayName
        : "Joylashuvingiz"
    }}
  </p>
</template>
