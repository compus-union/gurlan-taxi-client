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
const { loading } = storeToRefs(loadingStore);

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
      <div class="typing" v-show="typing">Searching...</div>
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
