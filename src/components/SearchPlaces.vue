<script lang="ts" setup>
import { useSearchPlaces } from "@/store/searchPlaces";
import { ref } from "vue";
import { useLoading } from "@/store/loading";
import { storeToRefs } from "pinia";
import { loadingController } from "@ionic/vue";
import { Button } from "./ui/button";

const loadingStore = useLoading();
const searchPlacesStore = useSearchPlaces();
const typing = ref(false);

const { notFound, places } = storeToRefs(searchPlacesStore);
const { loading } = storeToRefs(loadingStore);

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
</script>

<template>
  <div
    class="search-place-modal w-full bg-primary-foreground"
  >
    <h1 class="title text-3xl">Search places</h1>
    <Button class="mt-8">Display</Button>
  </div>
</template>

<style scoped>
.bigger-text {
  font-size: 20px;
}
</style>
