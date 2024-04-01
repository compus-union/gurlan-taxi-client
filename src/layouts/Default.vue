<script setup lang="ts">
import { Preferences } from "@capacitor/preferences";
import { useRouter } from "vue-router";
import { defineAsyncComponent, onMounted, ref, watch } from "vue";
import { useMaps } from "@/store/maps";
import { useAuth } from "@/store/auth";
import { ResponseStatus } from "@/constants";
import { loadingController } from "@ionic/vue";
import { toast } from "vue3-toastify";
import { storeToRefs } from "pinia";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Marker from "@/components/functional/Marker.vue";
import { List, LogOut, MapPin, User, AlignJustify } from "lucide-vue-next";

const Button = defineAsyncComponent(
  () => import("@/components/ui/button/Button.vue")
);

const router = useRouter();
const mapsStore = useMaps();
const authStore = useAuth();
const displayErrorMessage = ref(false);
const canMapLoaded = ref(false);

const { mapLoaded, isMarkerAnimating, markerVisible } = storeToRefs(mapsStore);

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
    displayErrorMessage.value = true;

    toast(error);
    return { status: "no" };
  } finally {
    await checkLoading.dismiss();
  }
};

onMounted(async () => {
  const mapLoading = await createLoading("Xarita yuklanmoqda...");

  try {
    const check = await checkClient();

    if (check.status === "no") {
      throw new Error("Xaritani yuklashni imkoni yo'q");
    }

    await mapsStore.loadMap("map");

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

watch(
  () => mapLoaded.value,
  async () => {
    await mapsStore.initialiseEvents();
  }
);

const logout = async () => {
  await Preferences.clear();

  await router.push({ path: "/auth/login" });
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
            <DropdownMenuItem class="text-lg">
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
    <div id="map" class="map h-screen w-full z-[49]">
      <div v-if="displayErrorMessage" class="error-message mt-10 text-center">
        <h1 class="title text-foreground text-2xl font-bold">
          Xatolik yuzaga keldi
        </h1>
        <p>Dasturni boshqatdan ishga tushiring</p>
      </div>
    </div>
    <RouterView
      v-if="!displayErrorMessage"
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
