<script setup lang="ts">
import { useGeocoding } from "@/store/geocoding";
import { storeToRefs } from "pinia";
import { defineAsyncComponent, onMounted, ref, watch } from "vue";
import { useMaps } from "@/store/maps";
import router from "@/router";
import { onBeforeRouteLeave } from "vue-router";
import { useOriginCoords } from "@/store/origin";
import {
  Flag,
  Check,
  ChevronLeft,
  Search,
  CircleSlash2,
  MapPin,
} from "lucide-vue-next";
import { useDestination } from "@/store/destination";
import { useLoading } from "@/store/loading";
import { useSearchPlaces } from "@/store/searchPlaces";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useRoute } from "vue-router";
import { LayerGroup, Map } from "leaflet";
import { loadingController, toastController } from "@ionic/vue";
import { useRoutes } from "@/store/routes";

const Input = defineAsyncComponent(
  () => import("@/components/ui/input/Input.vue")
);
const SkeletonLoading = defineAsyncComponent(
  () => import("@/components/functional/SkeletonLoading.vue")
);

const Button = defineAsyncComponent(
  () => import("@/components/ui/button/Button.vue")
);

const route = useRoute();

const routesStore = useRoutes();
const mapsStore = useMaps();
const originStore = useOriginCoords();
const geocodingStore = useGeocoding();
const destinationStore = useDestination();
const loadingStore = useLoading();
const searchPlacesStore = useSearchPlaces();

const { lat, lng } = storeToRefs(originStore);
const { sharedMap, defaultZoom, markers } = storeToRefs(mapsStore);
const {
  lat: destinationLat,
  lng: destinationLng,
  coords: destinationCoords,
} = storeToRefs(destinationStore);
const { loading } = storeToRefs(loadingStore);
const { destinationAddress, notFound, errorMessage, originAddress } =
  storeToRefs(geocodingStore);
const { mapMoving } = storeToRefs(mapsStore);
const { notFound: searchPlaceNotFound, places } =
  storeToRefs(searchPlacesStore);

onMounted(async () => {
  await mapsStore.addDestinationMarker();
});

onMounted(async () => {
  await geocodingStore.geocoding(
    destinationLat.value,
    destinationLng.value,
    "destination"
  );
});

onBeforeRouteLeave(async (to, from, next) => {
  if (to.path === "/ride/setOrigin") {
    sharedMap.value?.setView([lat.value, lng.value], defaultZoom.value);
  }
  await mapsStore.addFixedDestinationMarker();

  return next();
});

watch(
  () => destinationCoords.value,
  async (newOne, oldOne) => {
    await geocodingStore.geocoding(newOne.lat, newOne.lng, "destination");
  },
  { deep: true }
);

const goBack = async () => {
  router.push("/ride/setOrigin");
};

const typing = ref(false);
const placeName = ref("");

function createDebounce() {
  let timeout: any;
  return function (fnc?: () => Promise<void>, delayMs?: number) {
    searchPlaceNotFound.value = false;
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

async function changeDestinationCoords(payload: { lat: number; lng: number }) {
  await destinationStore.changeCoords(
    { lat: payload.lat, lng: payload.lng },
    "void"
  );

  if (route.path === "/ride/setDestination") {
    sharedMap.value?.setView([payload.lat, payload.lng]);

    const destinationMarker = markers.value.find((m) => {
      return m._custom_id === "destination-marker";
    });

    destinationMarker
      ?.setLatLng([payload.lat, payload.lng])
      .addTo(sharedMap.value as Map | LayerGroup<any>);
  }
}

async function letsGo() {
  try {
    const loading = await loadingController.create({
      message: "Yuklanmoqda...",
    });
    await loading.present();

    const result = await routesStore.getGeometryOfRoute(
      {
        lat: destinationAddress.value?.lat as number,
        lng: destinationAddress.value?.lng as number,
        name: destinationAddress.value?.name as string,
      },
      {
        lat: originAddress.value?.lat as number,
        lng: originAddress.value?.lng as number,
        name: originAddress.value?.name as string,
      }
    );

    if (!result) {
      await loading.dismiss();
      const toast = await toastController.create({
        message: "Xatolik yuzaga keldi, boshqatdan urinib ko'ring",
        duration: 4000,
      });

      await toast.present();
      return;
    }

    if (result?.status !== "ok") {
      await loading.dismiss();
      const toast = await toastController.create({
        message: "Xatolik yuzaga keldi, boshqatdan urinib ko'ring",
        duration: 4000,
      });

      await toast.present();
      return;
    }

    await loading.dismiss()
    await router.push("/ride/letsgo");
  } catch (error) {
    console.log(error);
    const toast = await toastController.create({
      message: "Xatolik yuzaga keldi, boshqatdan urinib ko'ring",
      duration: 4000,
    });

    await toast.present();
  }
}
</script>

<template>
  <div class="set-destination-page h-auto flex flex-col">
    <Button @click="goBack" class="mb-4 justify-self-end self-end mr-4"
      ><ChevronLeft class="w-4 h-4 mr-2" /> Orqaga</Button
    >
    <div
      class="main-content bg-primary-foreground text-foreground p-6 custom-style"
    >
      <h1 class="text-primary font-bold text-xl mb-4">Boradigan manzilingiz</h1>
      <p class="text-primary flex items-start font-semibold">
        <Flag class="w-[20px] h-[20px] mr-2" />
        {{
          notFound
            ? errorMessage
            : loading || mapMoving
            ? "Aniqlanmoqda..."
            : destinationAddress?.name || destinationAddress?.displayName
        }}
      </p>

      <Sheet>
        <SheetTrigger as-child>
          <Button variant="outline" class="w-full mt-4"
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
                      changeDestinationCoords({
                        lat: +place.lat,
                        lng: +place.lon,
                      })
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
      <Button @click="letsGo" class="w-full mt-4"
        ><Check class="w-4 h-4 mr-2" /> Belgilash</Button
      >
    </div>
  </div>
</template>

<style scoped>
.custom-style {
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -8px 8px -2px rgba(0, 0, 0, 0.2);
}
</style>
