<script setup lang="ts">
import { useGeocoding } from "@/store/geocoding";
import { storeToRefs } from "pinia";
import { computed, defineAsyncComponent, onMounted, ref, watch } from "vue";
import { useMaps } from "@/store/maps";
import router from "@/router";
import { onBeforeRouteLeave } from "vue-router";
import { useOriginCoords } from "@/store/origin";
import {
  Check,
  ChevronLeft,
  Search,
  CircleSlash2,
  MapPin,
  Loader,
  ArrowLeft
} from "lucide-vue-next";
import { useDestination } from "@/store/destination";
import { useLoading } from "@/store/loading";
import { useSearchPlaces } from "@/store/searchPlaces";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
  SheetHeader
} from "@/components/ui/sheet";
import { loadingController } from "@ionic/vue";
import { useRoutes } from "@/store/routes";
import { toast } from "vue-sonner";

const Input = defineAsyncComponent(
  () => import("@/components/ui/input/Input.vue")
);
const SkeletonLoading = defineAsyncComponent(
  () => import("@/components/functional/SkeletonLoading.vue")
);

const MainButton = defineAsyncComponent(
  () => import("@/components/ui/button/Button.vue")
);

const routesStore = useRoutes();
const mapsStore = useMaps();
const originStore = useOriginCoords();
const geocodingStore = useGeocoding();
const destinationStore = useDestination();
const loadingStore = useLoading();
const searchPlacesStore = useSearchPlaces();

const { lat: originLat, lng: originLng } = storeToRefs(originStore);
const { sharedMap, defaultZoom, markerVisible } = storeToRefs(mapsStore);
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
  await geocodingStore.geocoding(
    destinationLat.value,
    destinationLng.value,
    "destination"
  );
});

onBeforeRouteLeave(async (to, from, next) => {
  if (to.path === "/ride/setOrigin") {
    sharedMap.value?.setView(
      [originLat.value, originLng.value],
      defaultZoom.value
    );
  }

  return next();
});

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
const debouncedGeocoding = geocodingDebounce(
  async (newOne: any, oldOne: any) => {
    await geocodingStore.geocoding(newOne[0].lat, newOne[0].lng, "destination");
  },
  800
);

watch(
  () => [destinationCoords.value, mapMoving.value],
  async (newOne, oldOne) => {
    if (!newOne[1]) {
      await loadingStore.setLoading(true);
      await debouncedGeocoding(newOne);
    }
  },
  {
    deep: true,
  }
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

  sharedMap.value?.setView([payload.lat, payload.lng], defaultZoom.value);

  return;
}

async function letsGo() {
  try {
    markerVisible.value = false;
    const loading = await loadingController.create({
      message: "Yuklanmoqda...",
    });
    await loading.present();

    const result = await routesStore.getGeometryOfRoute(
      {
        lat: destinationAddress.value?.lat as number,
        lng: destinationAddress.value?.lng as number,
        name: "",
      },
      {
        lat: originAddress.value?.lat as number,
        lng: originAddress.value?.lng as number,
        name: "",
      }
    );

    if (!result) {
      await loading.dismiss();
      toast.error("Xatolik yuzaga keldi, boshqatdan urinib ko'ring", {
        duration: 4000,
      });

      return;
    }

    if (result?.status !== "ok") {
      await loading.dismiss();
      toast.error("Xatolik yuzaga keldi, boshqatdan urinib ko'ring", {
        duration: 4000,
      });

      return;
    }

    if (result.status === "ok") {
      await mapsStore.addFixedMarkers(
        originAddress.value,
        destinationAddress.value
      );
      await router.push("/ride/letsgo");
      await loading.dismiss();
    }
  } catch (error) {
    console.log(error);
    toast.error("Xatolik yuzaga keldi, boshqatdan urinib ko'ring", {
      duration: 4000,
    });
  }
}

const buttonDisabled = computed(() => {
  if ((mapMoving.value && loading.value) || mapMoving.value || loading.value) {
    return true;
  }
});
</script>

<template>
  <div class="set-destination-page h-auto flex flex-col">
    <MainButton
      @click="goBack"
      class="mb-4 justify-self-end self-end mr-4 font-manrope"
      ><ChevronLeft class="w-4 h-4 mr-2" /> Orqaga</MainButton
    >
    <div
      class="main-content bg-primary-foreground text-foreground p-6 custom-style"
    >
      <MainButton
        :disabled="buttonDisabled"
        @click="letsGo"
        class="transition-all py-6 text-lg font-manrope font-semibold w-full mb-2"
        ><span v-show="!buttonDisabled" class="flex items-center"
          ><Check class="w-4 h-4 mr-2" /> Belgilash</span
        >
        <span v-show="buttonDisabled" class="flex items-center"
          ><Loader class="w-4 h-4 mr-2 animate-spin" /> Yuklanmoqda...</span
        >
      </MainButton>
      <Sheet>
        <SheetTrigger as-child>
          <MainButton
            variant="outline"
            class="transition-all py-6 text-lg font-manrope font-semibold w-full"
            ><span v-show="!buttonDisabled" class="flex items-center">
              <Search class="w-4 h-4 mr-2" /> Qidirish
            </span>
            <span v-show="buttonDisabled" class="flex items-center"
              ><Loader class="w-4 h-4 mr-2 animate-spin" /> Yuklanmoqda...</span
            >
          </MainButton>
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
            <h1
              class="title text-xl text-foreground ml-2 font-semibold font-poppins"
            >
              Joy qidirish
            </h1>
          </SheetHeader>
          <div
            class="search-place-modal w-full bg-primary-foreground overflow-y-auto h-screen z-[100]"
          >
            <div class="form-part flex items-center justify-between">
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
                class="outline-none focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-transparent text-lg placeholder:text-base font-manrope focus-visible:border-primary"
              />
              <SheetClose as-child>
                <button
                  class="py-2 rounded text-primary-foreground bg-primary px-2 ml-4 font-manrope font-semibold"
                >
                  Xarita
                </button></SheetClose
              >
            </div>
            <div
              v-show="!typing && !places?.length && !notFound"
              class="suggestion text-center mt-4 font-manrope"
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
    </div>
  </div>
</template>

<style scoped>
.custom-style {
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -8px 8px -2px rgba(0, 0, 0, 0.2);
}
</style>
