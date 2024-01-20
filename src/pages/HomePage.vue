<script setup lang="ts">
import { useMaps } from "@/store/maps";
import { useOriginCoords } from "@/store/origin";
import SearchPlaces from "@/components/SearchPlaces.vue";
import { useRouter } from "vue-router";
import { Preferences } from "@capacitor/preferences";
import { defineAsyncComponent } from "vue";

const Button = defineAsyncComponent(
  () => import("@/components/ui/button/Button.vue"),
);

const mapsStore = useMaps();
const originStore = useOriginCoords();
const router = useRouter();

const goBackToLocation = async () => {
  const coords = await originStore.getCoords();

  mapsStore.sharedMap?.setCenter(originStore.coords);

  const originMarker = await mapsStore.getMarker("origin-marker");

  originMarker.setPosition(originStore.coords);
};

const openSearchPlaces = async () => {
  // const modal = await modalController.create({
  //   component: SearchPlaces,
  // });

  let modal: any;

  // open and set up a modal

  await modal.present();

  const { data, role } = await modal.onWillDismiss();

  if (role === "confirm") {
    await originStore.changeCoords({ lat: +data.lat, lng: +data.lon });

    mapsStore.sharedMap?.setCenter({ lat: +data.lat, lng: +data.lon });

    const marker = await mapsStore.getMarker("origin-marker");
    marker.setPosition({ lat: +data.lat, lng: +data.lon });

    return;
  }
};

const logout = async () => {
  await Preferences.clear();
  await router.push({ path: "/auth/login" });
};

const navigateNextPage = async () => {
  await router.push("/ride/setDestination");
};

const sayHi = () => {
  alert("hi man");
};
</script>

<template>
  <div class="home-page h-auto text-foreground">
    <h1 class="text-foreground">Hi man, wtf is this</h1>
    <Button @click="sayHi">Log out</Button>
  </div>
</template>
