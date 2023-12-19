<script setup lang="ts">
import { useMaps } from "@/store/maps";
import { useOriginCoords } from "@/store/origin";
import SearchPlaces from "@/components/SearchPlaces.vue";
import { useRouter } from "vue-router";

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

const navigateNextPage = async () => {
  await router.push("/ride/setDestination");
};
</script>

<template>
  <div class="home-page h-auto text-foreground">
    Home page
  </div>
</template>
