<script setup lang="ts">
import { Preferences } from "@capacitor/preferences";
import { onBeforeRouteLeave, useRouter, useRoute } from "vue-router";
import { computed, defineAsyncComponent, onMounted, ref, watch } from "vue";
import { useMaps } from "@/store/maps";
import { useAuth } from "@/store/auth";
import { ResponseStatus } from "@/constants";
import { loadingController } from "@ionic/vue";
import { toast } from "vue-sonner";
import { storeToRefs } from "pinia";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Marker from "@/components/functional/Marker.vue";
import {
  List,
  LogOut,
  MapPin,
  User,
  AlignJustify,
  Map,
  Locate,
  Flag,
  Settings2,
} from "lucide-vue-next";
import { PageTransition } from "vue3-page-transition";
import { useClient } from "@/store/client";
import { useOriginCoords } from "@/store/origin";
import { useDestination } from "@/store/destination";
import { App as CapApp } from "@capacitor/app";
import RadarWave from "@/components/functional/RadarWave.vue";
import ReverseGeocoding from "@/components/functional/ReverseGeocoding.vue";
import { useLoading } from "@/store/loading";
import { useSearchPlaces } from "@/store/searchPlaces";
import { useGeocoding } from "@/store/geocoding";
import { state, initConnection } from "@/socket";

const originStore = useOriginCoords();
const destinationStore = useDestination();
const route = useRoute();
const router = useRouter();
const mapsStore = useMaps();
const authStore = useAuth();
const displayErrorMessage = ref(false);
const canMapLoaded = ref(false);
const clientStore = useClient();
const loadingStore = useLoading();
const searchPlacesStore = useSearchPlaces();
const geocodingStore = useGeocoding();

const {
  mapLoaded,
  isMarkerAnimating,
  markerVisible,
  sharedMap,
  defaultZoom,
  isRadarVisible,
  mapMoving,
  isSearching,
} = storeToRefs(mapsStore);
const { lat: originLat, lng: originLng } = storeToRefs(originStore);
const { loading } = storeToRefs(loadingStore);
const { places, notFound } = storeToRefs(searchPlacesStore);
const { destinationAddress, originAddress } = storeToRefs(geocodingStore);
const { lat: destinationLat, lng: destinationLng } =
  storeToRefs(destinationStore);

const typing = ref(false);

onMounted(async () => {
  await initConnection();
});

console.log(state.value.connected);

const createLoading = async (message: string) => {
  const loading = await loadingController.create({ message });
  await loading.present();
  return loading;
};

const checkClient = async () => {
  const checkLoading = await createLoading("Malumotlaringiz tekshirilmoqda...");

  try {
    const check = await authStore.check();

    if (!check) {
      canMapLoaded.value = false;
      throw new Error(
        "Qandaydir xatolik yuzaga keldi, dasturni boshqatdan ishga tushiring"
      );
    }

    if (
      check.status === ResponseStatus.TOKEN_NOT_FOUND ||
      check.status === ResponseStatus.CLIENT_NOT_FOUND ||
      check.status === ResponseStatus.TOKEN_NOT_VALID ||
      check.status === ResponseStatus.BANNED
    ) {
      displayErrorMessage.value = true;

      await router.push({ path: "/auth/login" });
      return { status: "no" };
    } else if (
      check.status === ResponseStatus.UNKNOWN_ERR ||
      check.status === ResponseStatus.NETWORK_ERR
    ) {
      displayErrorMessage.value = true;
      return { status: "no" };
    } else {
      displayErrorMessage.value = false;
      return { status: "ok" };
    }
  } catch (error: any) {
    console.log(error);

    displayErrorMessage.value = true;

    toast.error(
      error.message ||
        error.response.data.msg ||
        "Qandaydir xatolik yuz berdi, boshqatdan urinib ko'ring",
      { duration: 4000 }
    );

    return { status: "no" };
  } finally {
    await checkLoading.dismiss();
  }
};

async function extractCoordsFromUrl(data: string) {
  const geoOnly = data.split("?")[0];

  const regex = /geo:([-+]?\d*\.?\d+),([-+]?\d*\.?\d+)/;
  const match = geoOnly.match(regex);

  if (match) {
    const latitude = parseFloat(match[1]);
    const longitude = parseFloat(match[2]);

    return { latitude, longitude };
  } else {
    return;
  }
}

onMounted(async () => {
  const mapLoading = await createLoading("Xarita yuklanmoqda...");

  try {
    const check = await checkClient();
    await clientStore.getClient();

    if (check.status === "no") {
      throw new Error("Xaritani yuklashni imkoni yo'q");
    }

    await mapsStore.loadMap("map");

    CapApp.addListener("appUrlOpen", async (data) => {
      const destinationCoords = await extractCoordsFromUrl(data.url);

      await router.push("/ride/setDestination");

      await destinationStore.changeCoords(
        {
          lat: destinationCoords?.latitude as number,
          lng: destinationCoords?.longitude as number,
        },
        "void"
      );

      setTimeout(async () => {
        sharedMap.value?.setView(
          [
            destinationCoords?.latitude as number,
            destinationCoords?.longitude as number,
          ],
          defaultZoom.value
        );

        if (!originLat.value && !originLng.value) {
          await originStore.getCoords();
        }
      }, 1000);
    });

    return;
  } catch (error: any) {
    toast.error(
      error.message ||
        error.response.data.msg ||
        "Qandaydir xatolik yuz berdi, boshqatdan urinib ko'ring",
      { duration: 4000 }
    );
  } finally {
    await mapLoading.dismiss();
  }
});

watch(
  () => mapLoaded.value,
  async (newOne, oldOne) => {
    if (newOne) {
      await mapsStore.initialiseEvents();
    }
  }
);

onBeforeRouteLeave(async (to, from, next) => {
  if (to.path !== "/ride/setDestination") {
    mapLoaded.value = false;
    return next();
  }

  return next();
});

const logout = async () => {
  await Preferences.clear();

  await router.push({ path: "/auth/login" });
};

const navigatePage = async (path: string) => {
  await router.push(path);
};

const geocodingBtnDisabled = computed(() => {
  if (loading.value || mapMoving.value || (loading.value && mapMoving.value)) {
    return true;
  }

  return false;
});

async function changeOriginCoords(coords: { lat: number; lng: number }) {
  try {
    isSearching.value = true;
    await originStore.changeCoords({ lat: coords.lat, lng: coords.lng });
    sharedMap.value?.setView([coords.lat, coords.lng], defaultZoom.value);
  } catch (error) {
    alert(error);
  }
}

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
const addressTypePage = ref<"origin" | "destination" | "">();

watch(
  () => route,
  async (newOne) => {
    if (newOne.fullPath === "/ride/setOrigin") {
      addressTypePage.value = "origin";
      return;
    }

    if (newOne.fullPath === "/ride/setDestination") {
      addressTypePage.value = "destination";
      return;
    }

    if (
      newOne.fullPath === "/ride/letsgo" ||
      newOne.fullPath === "/ride/taxi"
    ) {
      addressTypePage.value = "";
      return;
    }
  },
  { deep: true, immediate: true }
);

async function changeDestinationCoords(payload: { lat: number; lng: number }) {
  await destinationStore.changeCoords(
    { lat: payload.lat, lng: payload.lng },
    "void"
  );

  sharedMap.value?.setView([payload.lat, payload.lng], defaultZoom.value);

  return;
}

const showReverseGeocodingComponent = computed(() => {
  if (
    route.fullPath === "/ride/setOrigin" ||
    route.fullPath === "/ride/setDestination"
  ) {
    return true;
  }

  return false;
});

async function goBackTo(path: string) {
  if (route.fullPath === "/ride/taxi") return;
  if (path === "/ride/setDestination") {
    sharedMap.value?.setView([destinationLat.value, destinationLng.value]);
  }
  if (path === "/ride/setOrigin") {
    sharedMap.value?.setView([originLat.value, originLng.value]);
  }
  await router.push(path);
}
</script>

<template>
  <div class="default-layout">
    <header
      v-if="displayErrorMessage === false"
      class="header fixed top-0 w-full h-auto z-50"
    >
      <nav class="navbar container mx-auto px-2 py-4 flex items-start">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <button
              class="bg-primary-foreground p-2 flex items-center text-primary shadow-lg rounded-full"
            >
              <AlignJustify :size="24" /></button
          ></DropdownMenuTrigger>
          <DropdownMenuContent class="font-manrope font-semibold space-y-2">
            <DropdownMenuItem
              class="text-lg"
              @click="navigatePage('/ride/setOrigin')"
              :class="{
                'bg-black text-white': route.path === '/ride/setOrigin',
              }"
            >
              <Map class="w-5 h-5 mr-2" /> Buyurtma berish
            </DropdownMenuItem>
            <DropdownMenuItem
              class="text-lg"
              :class="{
                'bg-black text-white': route.path === '/options/profile',
              }"
              @click="navigatePage('/options/profile')"
            >
              <User class="w-5 h-5 mr-2" /> Profil
            </DropdownMenuItem>
            <DropdownMenuItem class="text-lg">
              <MapPin class="w-5 h-5 mr-2" /> Saqlangan joylar
            </DropdownMenuItem>
            <DropdownMenuItem class="text-lg">
              <List class="w-5 h-5 mr-2" /> Buyurtmalar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="text-lg text-red-500">
              <LogOut class="w-5 h-5 mr-2" /> Chiqish
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- Reverse Geocoding Component -->
        <button
          v-if="showReverseGeocodingComponent"
          :disabled="geocodingBtnDisabled"
          class="right ml-2 flex items-center justify-between text-left bg-primary-foreground text-primary overflow-hidden shadow-lg w-full rounded-md px-3 py-3 disabled:bg-gray-100 disabled:text-gray-400 transition-all"
        >
          <ReverseGeocoding :component-type="addressTypePage" />
        </button>
        <div
          v-if="!showReverseGeocodingComponent"
          class="ml-2 flex flex-col justify-between text-left overflow-hidden w-full rounded-md space-y-2 disabled:bg-gray-100 disabled:text-gray-400 transition-all"
        >
          <button
            @click="goBackTo('/ride/setOrigin')"
            class="flex custom-shadow items-center justify-between bg-primary-foreground text-primary overflow-hidden shadow-xl w-full rounded-md px-3 py-2"
          >
            <p class="font-manrope font-bold flex flex-row items-start w-[80%]">
              <Locate class="mr-2 shrink-0 mt-2" :size="18" />
              <span class="right w-full text-left"
                ><p class="text-[12px] font-poppins font-bold opacity-50">
                  Qayerdan
                </p>
                <p
                  class="text-lg overflow-hidden whitespace-nowrap text-ellipsis -mt-1"
                >
                  {{ originAddress?.name || originAddress?.displayName }}
                </p>
              </span>
            </p>
            <Settings2 v-show="route.fullPath !== '/ride/taxi'" />
          </button>
          <button
            @click="goBackTo('/ride/setDestination')"
            class="flex items-center custom-shadow relative justify-between bg-primary-foreground text-primary overflow-hidden shadow-xl w-full rounded-md px-3 py-2"
          >
            <p class="font-manrope font-bold flex flex-row items-start w-[80%]">
              <Flag class="mr-2 shrink-0 mt-2" :size="18" />
              <span class="right w-full text-left"
                ><p class="text-[12px] font-poppins font-bold opacity-50">
                  Qayerga
                </p>
                <p
                  class="text-lg overflow-hidden whitespace-nowrap text-ellipsis -mt-1"
                >
                  {{
                    destinationAddress?.name || destinationAddress?.displayName
                  }}
                </p>
              </span>
            </p>
            <Settings2 v-show="route.fullPath !== '/ride/taxi'" />
          </button>
        </div>
      </nav>
    </header>
    <Marker
      v-show="markerVisible"
      :isAnimated="isMarkerAnimating"
      class="marker fixed inset-1/2 z-50 -translate-x-1/2 -translate-y-[91px]"
    />
    <RadarWave
      v-show="isRadarVisible"
      class="fixed inset-[50%] z-50 my-[-10px] mx-[-10px]"
    />
    <div id="map" class="map h-screen w-full z-[49]">
      <div v-if="displayErrorMessage" class="error-message mt-10 text-center">
        <h1 class="title text-foreground text-2xl font-bold">
          Xatolik yuzaga keldi
        </h1>
        <p>Dasturni boshqatdan ishga tushiring</p>
      </div>
    </div>
    <router-view
      v-if="!displayErrorMessage"
      class="h-auto fixed bottom-0 w-full z-[49]"
      v-slot="{ Component }"
    >
      <PageTransition name="fade-in-up" appear>
        <component :is="Component" />
      </PageTransition>
    </router-view>
  </div>
</template>

<style>
.custom-shadow {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

img[alt="Google"] {
  display: none;
}

div.gmnoprint {
  display: none;
}
</style>
