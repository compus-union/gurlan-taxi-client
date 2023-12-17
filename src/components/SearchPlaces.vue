<script lang="ts" setup>
import { useSearchPlaces } from "@/store/searchPlaces";
import { ref, toRefs } from "vue";
import { useLoading } from "@/store/loading";

const loadingStore = useLoading();
const searchPlacesStore = useSearchPlaces();
const typing = ref(false);

function createDebounce() {
  let timeout = ref<any>();
  return function (fnc: Function, delayMs: number) {
    typing.value = true;
    clearTimeout(timeout.value);
    timeout.value = setTimeout(() => {
      fnc();
      typing.value = false;
    }, delayMs || 500);
  };
}

const debounce = ref<Function>(createDebounce());

const placeName = ref();

const loadingRef = toRefs(loadingStore);
</script>

<template>
  <div>Search places</div>
</template>

<style scoped>
.bigger-text {
  font-size: 20px;
}
</style>
