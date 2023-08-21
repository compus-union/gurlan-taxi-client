<script setup lang="ts">
import { Preferences } from "@capacitor/preferences";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonMenu,
  IonMenuButton,
  IonPage,
  IonRouterOutlet,
  IonSplitPane,
  IonTitle,
  IonToolbar,
  loadingController,
} from "@ionic/vue";
import { useRouter } from "vue-router";
import { defineComponent, onBeforeMount, onMounted, ref } from "vue";
import { useMaps } from "@/store/maps";
import { useCoords } from "@/store/coords";

const router = useRouter();
const mapsStore = useMaps();
const coordsStore = useCoords();

const map = ref<google.maps.Map>();

onBeforeMount(async () => {
  const { value: auth_token } = await Preferences.get({ key: "auth_token" });
  const { value: clientOneId } = await Preferences.get({ key: "clientOneId" });

  if (auth_token && clientOneId) {
    return;
  }

  router.push("/register");
});

async function assignMap() {
  const { Map } = await mapsStore.loadMap();

  map.value = new Map(document.getElementById("map") as HTMLElement, {
    center: coordsStore.coords,
    zoom: 17,
    mapTypeId: "OSM",
    mapTypeControl: false,
    streetViewControl: false,
    disableDefaultUI: true,
  });

  map.value.mapTypes.set(
    "OSM",
    new google.maps.ImageMapType({
      getTileUrl: function (coord, zoom) {
        var tilesPerGlobe = 1 << zoom;
        var x = coord.x % tilesPerGlobe;
        if (x < 0) {
          x = tilesPerGlobe + x;
        }

        return (
          "https://tile.openstreetmap.org/" +
          zoom +
          "/" +
          x +
          "/" +
          coord.y +
          ".png"
        );
      },
      tileSize: new google.maps.Size(256, 256),
      name: "OpenStreetMap",
      maxZoom: 18,
    })
  );

  await mapsStore.setMap(map.value);
}

onMounted(async () => {
  await coordsStore.getCoords();

  const loading = await loadingController.create({
    message: "Xarita yuklanmoqda...",
  });

  await Promise.all([
    await assignMap(),
    await loading.present(),
    await loading.dismiss(),
  ]);
});
</script>

<template>
  <IonPage>
    <IonSplitPane contentId="my-content">
      <IonMenu contentId="my-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Menu</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent class="p-4">
          <IonTitle>Hello</IonTitle>
        </IonContent>
      </IonMenu>

      <div class="ion-page font-bricolage" id="my-content">
        <IonHeader>
          <IonToolbar class="flex">
            <IonButtons slot="start">
              <IonButton>
                <IonMenuButton></IonMenuButton>
              </IonButton>
            </IonButtons>
            <IonTitle class="font-bricolage text-lg">
              Bonus: 40,000 so'm</IonTitle
            >
          </IonToolbar>
        </IonHeader>
        <IonRouterOutlet contentId="my-content"></IonRouterOutlet>
        <IonContent>
          <div id="map" class="h-[100dvh] w-full z-[99999999]"></div>
        </IonContent>
      </div>
    </IonSplitPane>
  </IonPage>
</template>

<style>
ion-menu::part(backdrop) {
  background-color: rgba(0, 0, 0, 0.694);
}
</style>
