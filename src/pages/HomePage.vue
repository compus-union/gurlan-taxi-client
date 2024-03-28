<script setup lang="ts">
import { useMaps } from "@/store/maps";
import { useOriginCoords } from "@/store/origin";
import { useRouter } from "vue-router";
import { Preferences } from "@capacitor/preferences";
import { computed, defineAsyncComponent, ref, watch } from "vue";
import {
  CircleSlash2,
  Locate,
  MapPin,
  Search,
  Loader,
  ArrowLeft,
} from "lucide-vue-next";
import { storeToRefs } from "pinia";
import { loadingController } from "@ionic/vue";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
  SheetHeader,
} from "@/components/ui/sheet";
import { useSearchPlaces } from "@/store/searchPlaces";
import { useDestination } from "@/store/destination";
import { onBeforeRouteLeave } from "vue-router";
import { LayerGroup, Map } from "leaflet";
import { Geolocation } from "@capacitor/geolocation";
import { useLoading } from "@/store/loading";

const MainButton = defineAsyncComponent(
  () => import("@/components/ui/button/Button.vue")
);
const Input = defineAsyncComponent(
  () => import("@/components/ui/input/Input.vue")
);
const SkeletonLoading = defineAsyncComponent(
  () => import("@/components/functional/SkeletonLoading.vue")
);
const ReverseGeocoding = defineAsyncComponent(
  () => import("@/components/functional/ReverseGeocoding.vue")
);

const mapsStore = useMaps();
const originStore = useOriginCoords();
const router = useRouter();
const searchPlacesStore = useSearchPlaces();
const destinationStore = useDestination();
const loadingStore = useLoading();

const typing = ref(false);

const { sharedMap, defaultZoom, markers, mapMoving, isSearching } =
  storeToRefs(mapsStore);
const { notFound, places } = storeToRefs(searchPlacesStore);
const { lat: destinationLat, lng: destinationLng } =
  storeToRefs(destinationStore);
const { watchingCoords } = storeToRefs(originStore);
const { loading } = storeToRefs(loadingStore);

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

const goBackToLocation = async () => {
  const loading = await loadingController.create({
    message: "Joylashuvingiz aniqlanmoqda...",
  });
  try {
    watchingCoords.value = true;
    await loading.present();
    const { coords: result } = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
    });

    if (result) {
      const realLocationPoint = markers.value.find((m) => {
        return m._custom_id === "real-location-point";
      });
      realLocationPoint
        ?.setLatLng([result.latitude, result.longitude])
        .addTo(sharedMap.value as Map | LayerGroup<any>);
      await originStore.changeCoords({
        lat: result.latitude,
        lng: result.longitude,
      });


      sharedMap.value?.setView([result.latitude, result.longitude]);
    }

    return;
  } catch (error) {
    alert(error);
  } finally {
    await loading.dismiss();
  }
};

const navigateNextPage = async () => {
  await router.push("/ride/setDestination");
};

async function changeOriginCoords(coords: { lat: number; lng: number }) {
  try {
    isSearching.value = true;
    await originStore.changeCoords({ lat: coords.lat, lng: coords.lng });
    sharedMap.value?.setView([coords.lat, coords.lng], defaultZoom.value)
  } catch (error) {
    alert(error);
  }
}

const addToSavedPlaces = async (place: {
  lat: number;
  lng: number;
  name: string;
  displayName: string;
}) => {
  const id = Math.floor(Math.random() * 1000000);
  const { value } = await Preferences.get({ key: "savedPlaces" });

  if (!value || !JSON.parse(value).length) {
    let savedPlaces = [];

    savedPlaces.push({ ...place, id });

    await Preferences.set({
      key: "savedPlaces",
      value: JSON.stringify(savedPlaces),
    });

    return;
  }

  let savedPlaces = JSON.parse(value);

  savedPlaces.push({ ...place, id });

  await Preferences.set({
    key: "savedPlaces",
    value: JSON.stringify(savedPlaces),
  });

  return;
};

onBeforeRouteLeave(async (to, from, next) => {
  if (to.path === "/ride/setDestination") {
    if (destinationLat.value && destinationLng.value) {
      sharedMap.value?.setView(
        [destinationLat.value, destinationLng.value],
        defaultZoom.value
      );
    }
  }
  return next();
});

const buttonDisabled = computed(() => {
  if ((mapMoving.value && loading.value) || mapMoving.value || loading.value) {
    return true;
  }
});
</script>

<template>
  <div class="home-page h-auto flex flex-col">
    <ReverseGeocoding component-type="origin" />
    <MainButton
      @click="goBackToLocation"
      size="icon"
      :disabled="buttonDisabled"
      :class="{ 'translate-y-[72px] pointer-events-none': buttonDisabled }"
      class="absolute right-0 top-[-86px] transition-all w-auto h-auto flex items-center justify-center my-4 bg-primary-foreground text-foreground justify-self-end self-end mr-6 hover:bg-primary-foreground"
    >
      <Locate :size="28" class="m-3" />
    </MainButton>
    <div
      :class="{ 'translate-y-[72px] pointer-events-none': buttonDisabled }"
      class="main-buttons bg-primary-foreground text-foreground p-6 custom-style w-full transition-all"
    >
      <div class="buttons flex flex-col space-y-2">
        <MainButton
          class="transition-all py-6 text-lg font-manrope font-semibold"
          :disabled="buttonDisabled"
          @click="navigateNextPage"
          ><span v-show="buttonDisabled" class="flex items-center"
            ><Loader class="w-5 h-5 mr-2 animate-spin" /> Yuklanmoqda...</span
          >
          <span v-show="!buttonDisabled" class="flex items-center">
            <MapPin class="w-5 h-5 mr-2" /> Qayerga boramiz
          </span></MainButton
        >
        <Sheet>
          <SheetTrigger as-child>
            <MainButton
              class="w-full py-6 text-lg font-manrope font-semibold"
              variant="outline"
              ><Search class="w-5 h-5 mr-2" /> Qidirish</MainButton
            >
          </SheetTrigger>
          <SheetContent
            class="h-screen overflow-hidden flex flex-col"
            side="bottom"
          >
            <SheetHeader class="w-full flex items-center flex-row space-y-0">
              <SheetClose as-child>
                <MainButton variant="ghost" size="icon">
                  <ArrowLeft />
                </MainButton>
              </SheetClose>
              <h1 class="title text-xl text-foreground ml-2 font-semibold">
                Joy qidirish
              </h1>
            </SheetHeader>
            <div
              class="search-place-modal w-full bg-primary-foreground overflow-y-auto h-screen z-[100]"
            >
              <div class="form-group">
                <Input
                  type="text"
                  v-model="placeName"
                  @input="
                    debounce(
                      async () =>
                        await searchPlacesStore.searchPlaces(placeName),
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
                O'zingizga kerakli joy nomini izlang, masalan:
                <b>dehqon bozor</b>,
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
                  <SheetClose as-child>
                    <button
                      @click="
                        changeOriginCoords({ lat: +place.lat, lng: +place.lon })
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
                  </SheetClose>
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
                <h4 class="text-xl font-semibold text-[#71717A] mt-4">
                  Joy topilmadi
                </h4>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-style {
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -8px 8px -2px rgba(0, 0, 0, 0.2);
}
</style>
