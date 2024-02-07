<script lang="ts" setup>
import { useSearchPlaces } from "@/store/searchPlaces";
import { defineAsyncComponent, ref } from "vue";
import { storeToRefs } from "pinia";
import { CircleSlash2, MapPin } from "lucide-vue-next";

const Button = defineAsyncComponent(
  () => import("@/components/ui/button/Button.vue")
);
const Input = defineAsyncComponent(
  () => import("@/components/ui/input/Input.vue")
);
const SkeletonLoading = defineAsyncComponent(
  () => import("@/components/functional/SkeletonLoading.vue")
);
const ScrollArea = defineAsyncComponent(
  () => import("@/components/ui/scroll-area/ScrollArea.vue")
);


const searchPlacesStore = useSearchPlaces();
const typing = ref(false);

const { notFound, places } = storeToRefs(searchPlacesStore);

function createDebounce() {
  let timeout: any;
  return function (fnc?: () => Promise<void>, delayMs?: number) {
    notFound.value = false;
    typing.value = true;
    places.value = [];
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
  <div
    class="search-place-modal w-full bg-primary-foreground mt-3 overflow-y-auto h-screen"
  >
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
        placeholder="Joy izlash"
        class="outline-none focus-visible:ring-0 focus-visible:outline-none"
      />
    </div>
    <div
      v-show="!typing && !places?.length && !notFound"
      class="suggestion text-center mt-4"
    >
      O'zingizga kerakli joy nomini izlang, masalan: <b>dehqon bozor</b>,
      <b>hokimiyat</b>
    </div>
    <div v-show="typing" class="typing mt-6">
      <SkeletonLoading v-for="i in 5" :key="i" />
    </div>
    <div
      v-show="places?.length && !typing && !notFound"
      class="results mt-4 overflow-x-hidden overflow-y-scroll h-[80%] w-full"
    >
      <!-- @vue-skip -->
      <div
        v-for="place in places"
        :key="place.place_id"
        class="result overflow-x-hidden w-full"
      >
        <button
          @click="
            emit('update:originCoords', { lat: +place.lat, lng: +place.lon })
          "
          class="flex items-start justify-start py-4 border-t overflow-x-hidden w-full"
        >
          <div class="icon mr-2">
            <MapPin class="w-8 h-8" />
          </div>
          <div class="overflow-x-hidden text-left w-full">
            <h3
              class="place-name font-bold text-left overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {{ place.name }}
            </h3>
            <p
              class="place-detailed text-ellipsis whitespace-nowrap overflow-hidden text-sm w-full"
            >
              {{ place.display_name }}
            </p>
          </div>
        </button>
      </div>
    </div>
    <p
      v-show="places?.length && !typing && !notFound"
      class="text-sm text-gray-400 text-center mt-2"
    >
      Ko'proq ko'rish uchun pastga torting
    </p>
    <div
      v-show="!places?.length && !typing && notFound"
      class="not-found my-10 text-center flex flex-col items-center justify-center"
    >
      <CircleSlash2 class="w-16 h-16 text-[#71717A]" />
      <h4 class="text-xl font-semibold text-[#71717A] mt-4">Joy topilmadi</h4>
    </div>
  </div>
</template>

<style scoped>
.bigger-text {
  font-size: 20px;
}
</style>
