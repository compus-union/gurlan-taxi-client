<script setup lang="ts">
import { useMaps } from "@/store/maps";
import { useOriginCoords } from "@/store/origin";
import { useRouter } from "vue-router";
import { Preferences } from "@capacitor/preferences";
import { defineAsyncComponent, ref } from "vue";
import { Locate, MapPin, Search } from "lucide-vue-next";
import { storeToRefs } from "pinia";
import { loadingController } from "@ionic/vue";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Button = defineAsyncComponent(
  () => import("@/components/ui/button/Button.vue")
);
const SearchPlaces = defineAsyncComponent(
  () => import("@/components/SearchPlaces.vue")
);

const mapsStore = useMaps();
const originStore = useOriginCoords();
const router = useRouter();

const { sharedMap, defaultZoom, markers } = storeToRefs(mapsStore);
const { coords: originCoords, lat, lng } = storeToRefs(originStore);

const searchPlaceBottomSheet = ref();

const isSearchPlacesVisible = ref(false);

const goBackToLocation = async () => {
  const loading = await loadingController.create({
    message: "Joylashuvingiz aniqlanmoqda...",
  });
  try {
    await loading.present();
    await originStore.getCoords();

    sharedMap.value?.setView([lat.value, lng.value], defaultZoom.value);

    return;
  } catch (error) {
    alert(error);
  } finally {
    await loading.dismiss();
  }
};

const openSearchPlaces = async () => {
  isSearchPlacesVisible.value = true;
};

const closeSearchPlaces = () => {
  isSearchPlacesVisible.value = false;
};

const logout = async () => {
  await Preferences.clear();
  await router.push({ path: "/auth/login" });
};

const navigateNextPage = async () => {
  await router.push("/ride/setDestination");
};
</script>

<template>
  <div class="home-page h-auto flex flex-col">
    <Sheet>
      <SheetTrigger as-child>
        <Button
          @click="openSearchPlaces"
          class="mb-4 justify-self-end self-end mr-4"
          ><Search class="w-4 h-4 mr-2" /> Qidirish</Button
        >
      </SheetTrigger>
      <SheetContent class="h-screen overflow-hidden flex" side="bottom">
        <SearchPlaces class="z-[100] w-full" />
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
