<script setup lang="ts">
import { IonPage } from "@ionic/vue";
import { onMounted, ref } from "vue";
import { useMaps } from "@/store/maps";
import { useCoords } from "@/store/coords";
import icon from "@/assets/pin.png";

const mapsStore = useMaps();
const coordsStore = useCoords();

const markers = ref();

onMounted(async () => {
  const newMarker = new google.maps.Marker({
    position: coordsStore.coords,
    map: mapsStore.sharedMap,
    animation: google.maps.Animation.BOUNCE,
  });
});
</script>

<template>
  <IonPage class="relative items-center justify-center pointer-events-none">
    <div class="home-page">home page</div>
  </IonPage>
</template>
