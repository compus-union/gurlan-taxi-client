<script setup lang="ts">
import { IonButton, IonIcon } from "@ionic/vue";
import { locateOutline, locationOutline, searchOutline } from "ionicons/icons";
import { useMaps } from "@/store/maps";
import { useCoords } from "@/store/coords";
import Default from "@/layouts/Default.vue";
import Loading from "@/components/Loading.vue";

const mapsStore = useMaps();
const coordsStore = useCoords();

const goBackToLocation = async () => {
  await coordsStore.getCoords();

  mapsStore.sharedMap?.setCenter(coordsStore.coords);

  const originMarker = await mapsStore.getMarker("origin-marker");

  originMarker.setPosition(coordsStore.coords);
};
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
          <IonButton fill="clear" class="right-5">
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
