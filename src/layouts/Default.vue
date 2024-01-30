<script setup lang="ts">
import { Preferences } from "@capacitor/preferences";
import { useRouter } from "vue-router";
import { defineAsyncComponent, onBeforeMount, onMounted, ref } from "vue";
import { useMaps, CustomMarker } from "@/store/maps";
import { useAuth } from "@/store/auth";
import { useOriginCoords } from "@/store/origin";
import { ResponseStatus } from "@/constants";
import { loadingController } from "@ionic/vue";
import { toast } from "vue3-toastify";
import { HamburgerMenuIcon } from "@radix-icons/vue";
import { storeToRefs } from "pinia";
import { Marker } from "leaflet";

const AsideComponent = defineAsyncComponent(
  () => import("@/components/Aside.vue")
);

const Button = defineAsyncComponent(
  () => import("@/components/ui/button/Button.vue")
);

const router = useRouter();
const mapsStore = useMaps();
const authStore = useAuth();
const originStore = useOriginCoords();
const displayErrorMessage = ref(false);
const showAside = ref(false);
const canMapLoaded = ref(false);

const { sharedMap, markers } = storeToRefs(mapsStore);

const mapRef = ref(sharedMap);

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
        "Qadnaydir xatolik yuzaga keldi, dasturni boshqatdan ishga tushiring"
      );
    }

    if (
      check.status === ResponseStatus.TOKEN_NOT_FOUND ||
      check.status === ResponseStatus.CLIENT_NOT_FOUND ||
      check.status === ResponseStatus.TOKEN_NOT_VALID ||
      check.status === ResponseStatus.BANNED
    ) {
      displayErrorMessage.value = true;
      canMapLoaded.value = false;

      await router.push({ path: "/auth/login" });
      return { status: "no" };
    } else if (
      check.status === ResponseStatus.UNKNOWN_ERR ||
      check.status === ResponseStatus.NETWORK_ERR
    ) {
      canMapLoaded.value = false;
      displayErrorMessage.value = true;
      return { status: "no" };
    } else {
      canMapLoaded.value = true;
      return { status: "ok" };
    }
  } catch (error: any) {
    canMapLoaded.value = false;
    displayErrorMessage.value = true;

    toast(error);
    return { status: "no" };
  } finally {
    await checkLoading.dismiss();
  }
};

onBeforeMount(async () => {
  const mapLoading = await createLoading("Xarita yuklanmoqda...");

  try {
    const check = await checkClient();

    if (check.status === "no") {
      throw new Error("Xaritani yuklashni imkoni yo'q");
    }

    await mapsStore.loadMap("map");
    // await mapsStore.attachMoveChangingEvents();
    return;
  } catch (error: any) {
    toast(
      error.response?.data?.msg ||
        error.message ||
        "Xaritani yuklashda xatolik yuz berdi, dasturni boshqatdan ishga tushiring"
    );
  } finally {
    await mapLoading.dismiss();
  }
});

onMounted(() => {
  mapRef.value?.invalidateSize();
  console.log(mapRef.value);
});

const logout = async () => {
  await Preferences.clear();

  await router.push({ path: "/auth/login" });
};

const openAside = () => {
  if (showAside.value) return;
  showAside.value = true;
};

const closeAside = () => {
  if (!showAside.value) return;
  showAside.value = false;
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
        <div class="left">
          <Button
            @click="openAside"
            size="icon"
            variant="ghost"
            class="hover:bg-none"
            ><HamburgerMenuIcon class="h-4 w-4"
          /></Button>
        </div>
        <div class="right my-4 ml-2 text-lg font-semibold">
          Bonus: 45,000 so'm
        </div>
      </nav>
      <transition name="slide-left">
        <AsideComponent
          @update:closeAside="closeAside"
          :showAside="showAside"
        />
      </transition>
    </header>
    <div id="map" class="map h-screen w-full z-[49]">
      <div
        v-if="displayErrorMessage || !canMapLoaded"
        class="error-message mt-10 text-center"
      >
        <h1 class="title text-foreground text-2xl font-bold">
          Xatolik yuzaga keldi
        </h1>
        <p>Dasturni boshqatdan ishga tushiring</p>
      </div>
    </div>
    <RouterView
      v-if="displayErrorMessage === false && canMapLoaded"
      class="h-auto fixed bottom-0 w-full z-[49]"
    ></RouterView>
  </div>
</template>

<style scoped>
img[alt="Google"] {
  display: none;
}

div.gmnoprint {
  display: none;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>
