<script setup lang="ts">
import { IonButton, IonIcon, modalController } from "@ionic/vue";
import { locateOutline, locationOutline, searchOutline } from "ionicons/icons";
import { useMaps } from "@/store/maps";
import { useOriginCoords } from "@/store/origin";
import Default from "@/layouts/Default.vue";
import Loading from "@/components/Loading.vue";
import SearchPlaces from "@/components/SearchPlaces.vue";

const mapsStore = useMaps();
const originStore = useOriginCoords();

const goBackToLocation = async () => {
  const coords = await originStore.getCoords();

  console.log(coords);
  
  mapsStore.sharedMap?.setCenter(originStore.coords);

  const originMarker = await mapsStore.getMarker("origin-marker");

  originMarker.setPosition(originStore.coords);
};

const openSearchPlaces = async () => {
  const modal = await modalController.create({
    component: SearchPlaces,
  });

  await modal.present();

  const { data, role } = await modal.onWillDismiss();

  if (role === "confirm") {
    await originStore.changeCoords({ lat: +data.lat, lng: +data.lon });

    mapsStore.sharedMap?.setCenter({ lat: +data.lat, lng: +data.lon });

    const marker = await mapsStore.getMarker("origin-marker");
    marker.setPosition({ lat: +data.lat, lng: +data.lon });

    return;
  }
}
</script>

<template>
  <Default>
    <Loading />
    <div class="flex items-center w-screen justify-center h-auto">
      <div class="home-page w-full flex flex-col justify-between p-4 space-y-4">
        <div class="first-row flex items-center justify-between space-x-4">
          <IonButton class="w-full" @click="goBackToLocation()" fill="outline"
            ><IonIcon class="mr-4" slot="start" :icon="locateOutline"></IonIcon>
            Joylashuvimni ko'rsat</IonButton
          >
          <IonButton @click="openSearchPlaces" fill="clear" class="right-5">
            <IonIcon :icon="searchOutline"></IonIcon>
          </IonButton>
        </div>
        <IonButton color="primary"
          ><IonIcon class="mr-4" slot="start" :icon="locationOutline"></IonIcon>
          Qayerga boramiz?</IonButton
        >
      </div>
    </div>
  </Default>
</template>
@/store/origin
