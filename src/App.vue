<script setup lang="ts">
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import { Network } from "@capacitor/network";
import { onBeforeMount, onMounted, ref } from "vue";
import { useMaps } from "./store/maps";
import { useRoute, useRouter } from "vue-router";

const mapsStore = useMaps();
const router = useRouter();
const route = useRoute();

onBeforeMount(async () => {
  Network.addListener("networkStatusChange", async (s) => {
    const status = await Network.getStatus();

    if (status.connected) {
      if (route.path === "/no-internet") {
        router.go(-1);
      }
      return;
    }

    router.push("/no-internet");
  });

  const logCurrentNetworkStatus = async () => {
    const status = await Network.getStatus();

    if (status.connected) {
      if (route.path === "/no-internet") {
        router.go(-1);
      }
      return;
    }

    router.push("/no-internet");
  };

  await logCurrentNetworkStatus();
});

const map = ref();

// onMounted(async () => {
//   const { Map } = await mapsStore.loadMap();

//   map.value = new Map(document.getElementById("map") as HTMLElement, {
//     center: coordsStore.coords,
//     zoom: 17,
//     mapTypeId: "OSM",
//     mapTypeControl: false,
//     streetViewControl: false,
//     disableDefaultUI: true,
//   });

//   map.value.mapTypes.set(
//     "OSM",
//     new google.maps.ImageMapType({
//       getTileUrl: function (coord, zoom) {
//         var tilesPerGlobe = 1 << zoom;
//         var x = coord.x % tilesPerGlobe;
//         if (x < 0) {
//           x = tilesPerGlobe + x;
//         }

//         return (
//           "https://tile.openstreetmap.org/" +
//           zoom +
//           "/" +
//           x +
//           "/" +
//           coord.y +
//           ".png"
//         );
//       },
//       tileSize: new google.maps.Size(256, 256),
//       name: "OpenStreetMap",
//       maxZoom: 18,
//     })
//   );

//   await mapsStore.setMap(map.value);
// });
</script>

<template>
  <ion-app>
    <ion-router-outlet id="main-content"></ion-router-outlet>
  </ion-app>
</template>

<style scoped></style>
