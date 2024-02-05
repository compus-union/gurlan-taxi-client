<script lang="ts" setup>
import { useSearchPlaces } from "@/store/searchPlaces";
import { defineAsyncComponent, ref } from "vue";
import { storeToRefs } from "pinia";
import { CircleSlash2, MapPin, Copy } from "lucide-vue-next";

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
    class="search-place-modal w-full bg-primary-foreground mt-3 "
  >
    <div class="form-group ">
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
        <SkeletonLoading v-for="i in 5" :key="i" />
      </div>
      <ScrollArea
        class="results mt-4 overflow-x-hidden overflow-y-scroll h-[900px] w-full"
      >
        <!-- @vue-skip -->
        <div
          v-for="place in places"
          :key="place.place_id"
          class="result overflow-x-hidden w-full"
        >
          <button
            class="flex items-start justify-start py-4 border-t overflow-x-hidden w-full"
          >
            <div class="icon mr-2">
              <MapPin class="w-8 h-8" />
            </div>
            <div class="overflow-x-hidden text-left w-full">
              <h3
                class="place-name font-bold text-ellipsis whitespace-nowrap overflow-hidden text-left w-full"
              >
                Lorem, ipsum dolor sit amet consectetur
              </h3>

              <p
                class="place-detailed text-ellipsis whitespace-nowrap overflow-hidden text-sm w-full"
              >
                {{ place.display_name }}
              </p>
            </div>
          </button>
        </div>
        <!-- @vue-skip-->
        <div v-for="place in places" :key="place.place_id" class="result">
          <button class="flex items-start justify-start">
            <div class="icon mr-2">
              <MapPin class="w-8 h-8" />
            </div>
            <div class="text overflow-hidden">
              <h3
                class="place-name text-lg font-bold text-ellipsis whitespace-nowrap overflow-hidden"
              >
                {{ place.name }}
              </h3>
            </div>
          </button>
        </div>
      </ScrollArea>
      <div
        v-show="!places?.length && !typing && notFound"
        class="not-found my-10 text-center flex flex-col items-center justify-center"
      >
        <CircleSlash2 class="w-16 h-16 text-[#71717A]" />
        <h4 class="text-xl font-semibold text-[#71717A] mt-4">Joy topilmadi</h4>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bigger-text {
  font-size: 20px;
}
</style>
