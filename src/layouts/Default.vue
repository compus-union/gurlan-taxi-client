<script setup lang="ts">
import { Preferences } from "@capacitor/preferences";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import { defineAsyncComponent, onMounted, ref, watch } from "vue";
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
import { List, LogOut, MapPin, User, AlignJustify, Map } from "lucide-vue-next";
import { useRoute } from "vue-router";
import { PageTransition } from "vue3-page-transition";
import { useClient } from "@/store/client";
import { useOriginCoords } from "@/store/origin";
import { useDestination } from "@/store/destination";
import { App as CapApp } from "@capacitor/app";
import RadarWave from "@/components/functional/RadarWave.vue";

const Button = defineAsyncComponent(
  () => import("@/components/ui/button/Button.vue")
);

const originStore = useOriginCoords();
const destinationStore = useDestination();
const route = useRoute();
const router = useRouter();
const mapsStore = useMaps();
const authStore = useAuth();
const displayErrorMessage = ref(false);
const canMapLoaded = ref(false);
const clientStore = useClient();

const { mapLoaded, isMarkerAnimating, markerVisible, sharedMap, defaultZoom, isRadarVisible } =
  storeToRefs(mapsStore);
const { lat: originLat, lng: originLng } = storeToRefs(originStore);

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
      }, 100);
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
</script>

<template>
  <div class="default-layout">
    <header
      v-if="displayErrorMessage === false"
      class="header bg-primary-foreground fixed top-0 w-full h-auto z-50"
    >
      <nav
        class="navbar container mx-auto px-1 flex items-center border-b shadow-lg"
      >
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button size="icon" variant="ghost" class="hover:bg-none"
              ><AlignJustify class="h-4 w-4" /></Button
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

        <div class="right my-4 ml-2 text-lg font-semibold font-manrope">
          Bonus: 45,000 so'm
        </div>
      </nav>
    </header>
    <Marker
      v-show="markerVisible"
      :isAnimated="isMarkerAnimating"
      class="marker fixed inset-1/2 z-50 -translate-x-1/2 -translate-y-[91px]"
    />
    <RadarWave v-show="isRadarVisible" class="fixed inset-[50%] z-50 my-[-10px] mx-[-10px]"/>
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
img[alt="Google"] {
  display: none;
}

div.gmnoprint {
  display: none;
}
</style>
