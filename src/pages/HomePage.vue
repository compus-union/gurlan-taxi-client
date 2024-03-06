<script setup lang="ts">
import { useMaps } from "@/store/maps";
import { useOriginCoords } from "@/store/origin";
import { useRouter } from "vue-router";
import { Preferences } from "@capacitor/preferences";
import { defineAsyncComponent, ref, watch } from "vue";
import { CircleSlash2, Locate, MapPin, Search } from "lucide-vue-next";
import { storeToRefs } from "pinia";
import { loadingController } from "@ionic/vue";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSearchPlaces } from "@/store/searchPlaces";
import { useDestination } from "@/store/destination";
import { onBeforeRouteLeave } from "vue-router";
import { LayerGroup, Map } from "leaflet";
import { Geolocation } from "@capacitor/geolocation";

const Button = defineAsyncComponent(
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

const typing = ref(false);

const { sharedMap, defaultZoom, mapLoaded, markers } = storeToRefs(mapsStore);
const { notFound, places } = storeToRefs(searchPlacesStore);
const { lat: destinationLat, lng: destinationLng } =
  storeToRefs(destinationStore);
const { watchingCoords } = storeToRefs(originStore);

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

      const originMarker = markers.value.find((m) => {
        return m._custom_id === "origin-marker";
      });

      originMarker
        ?.setLatLng([result.latitude, result.longitude])
        .addTo(sharedMap.value as Map | LayerGroup<any>);

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

const navigateToLetsgoPage = async () => {
  await router.push("/ride/letsgo")
}

const changeOriginCoords = async (coords: { lat: number; lng: number }) => {
  await originStore.changeCoords({ lat: coords.lat, lng: coords.lng });
  sharedMap.value?.setView([coords.lat, coords.lng], defaultZoom.value);
};

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
  // Remove origin marker and add fixed origin marker
  if (to.path === "/ride/setDestination") {
    if (destinationLat.value && destinationLng.value) {
      sharedMap.value?.setView(
        [destinationLat.value, destinationLng.value],
        defaultZoom.value
      );
    }
    await mapsStore.addFixedOriginMarker();
  }
  return next();
});

watch(
  () => mapLoaded.value,
  async () => {
    await mapsStore.addOriginMarker();
  }
);

router.beforeEach(async (to, from, next) => {
  if (from.path === "/ride/setDestination") {
    await mapsStore.addOriginMarker();
  }

  return next();
});
</script>

<template>
  <div class="home-page h-auto flex flex-col">
    <ReverseGeocoding component-type="origin" />
    <Sheet>
      <SheetTrigger as-child>
        <Button class="mb-4 justify-self-end self-end mr-4"
          ><Search class="w-4 h-4 mr-2" /> Qidirish</Button
        >
      </SheetTrigger>
      <SheetContent class="h-screen overflow-hidden flex" side="bottom">
        <div
          class="search-place-modal w-full bg-primary-foreground mt-3 overflow-y-auto h-screen z-[100]"
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

    <div
      class="main-buttons bg-primary-foreground text-foreground p-6 custom-style"
    >
      <div class="buttons flex flex-col space-y-4">
        <Button @click="goBackToLocation" variant="outline"
          ><Locate class="w-4 h-4 mr-2" /> Hozirgi joylashuvim</Button
        >
        <Button @click="navigateNextPage"
          ><MapPin class="w-4 h-4 mr-2" /> Qayerga boramiz</Button
        >
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
