<script lang="ts" setup>
import { useSearchPlaces } from "@/store/searchPlaces";
import { defineAsyncComponent, onMounted, ref } from "vue";
import { useLoading } from "@/store/loading";
import { storeToRefs } from "pinia";
import { loadingController } from "@ionic/vue";

const Button = defineAsyncComponent(
  () => import("@/components/ui/button/Button.vue")
);
const Input = defineAsyncComponent(
  () => import("@/components/ui/input/Input.vue")
);

const loadingStore = useLoading();
const searchPlacesStore = useSearchPlaces();
const typing = ref(false);

const { notFound, places } = storeToRefs(searchPlacesStore);

function createDebounce() {
  let timeout: any;
  return function (fnc?: () => Promise<void>, delayMs?: number) {
    notFound.value = false;
    typing.value = true;
    return new Promise<void>((resolve) => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        if (fnc) await fnc();
        typing.value = false;
        resolve();
      }, delayMs || 500);
    });
  };
}

const debounce = ref<
  (fnc?: () => Promise<void>, delayMs?: number) => Promise<void>
>(createDebounce());
const placeName = ref<string>("");
</script>

<template>
  <div class="search-place-modal w-full bg-primary-foreground px-4">
    <div class="form-group">
      <Input
        type="text"
        v-model="placeName"
        @input="
          debounce(
            async () => await searchPlacesStore.searchPlaces(placeName),
            1000
          )
        "
        placeholder="Masalan: Eski bozor"
      />
      <div v-show="typing" class="typing mt-6">
        <div
          class="skeleton-loading mb-8 space-x-4 my-4 flex items-center justify-between w-full h-[40px]"
        >
          <div
            class="icon-part h-full w-[16%] flex items-center justify-center"
          >
            <div class="bg-gray-100 w-full h-full animate-pulse"></div>
          </div>
          <div class="text-part h-full w-full">
            <div class="h-4 mb-2 w-[50%] bg-gray-100 animate-pulse"></div>
            <div class="h-2 mb-2 w-full bg-gray-100 animate-pulse"></div>
            <div class="h-2 w-full bg-gray-100 animate-pulse"></div>
          </div>
        </div>
        <div
          class="skeleton-loading mb-8 space-x-4 my-4 flex items-center justify-between w-full h-[40px]"
        >
          <div
            class="icon-part h-full w-[16%] flex items-center justify-center"
          >
            <div class="bg-gray-100 w-full h-full animate-pulse"></div>
          </div>
          <div class="text-part h-full w-full">
            <div class="h-4 mb-2 w-[50%] bg-gray-100 animate-pulse"></div>
            <div class="h-2 mb-2 w-full bg-gray-100 animate-pulse"></div>
            <div class="h-2 w-full bg-gray-100 animate-pulse"></div>
          </div>
        </div>
        <div
          class="skeleton-loading mb-8 space-x-4 my-4 flex items-center justify-between w-full h-[40px]"
        >
          <div
            class="icon-part h-full w-[16%] flex items-center justify-center"
          >
            <div class="bg-gray-100 w-full h-full animate-pulse"></div>
          </div>
          <div class="text-part h-full w-full">
            <div class="h-4 mb-2 w-[50%] bg-gray-100 animate-pulse"></div>
            <div class="h-2 mb-2 w-full bg-gray-100 animate-pulse"></div>
            <div class="h-2 w-full bg-gray-100 animate-pulse"></div>
          </div>
        </div>
        <div
          class="skeleton-loading space-x-4 my-4 flex items-center justify-between w-full h-[40px]"
        >
          <div
            class="icon-part h-full w-[16%] flex items-center justify-center"
          >
            <div class="bg-gray-100 w-full h-full animate-pulse"></div>
          </div>
          <div class="text-part h-full w-full">
            <div class="h-4 mb-2 w-[50%] bg-gray-100 animate-pulse"></div>
            <div class="h-2 mb-2 w-full bg-gray-100 animate-pulse"></div>
            <div class="h-2 w-full bg-gray-100 animate-pulse"></div>
          </div>
        </div>
      </div>
      <div class="results" v-show="places?.length && !typing">Results</div>
      <div class="not-found" v-show="!places?.length && !typing && notFound">
        Not found
      </div>
    </div>
  </div>
</template>

<style scoped>
.bigger-text {
  font-size: 20px;
}
</style>
