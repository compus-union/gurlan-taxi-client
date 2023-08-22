<script setup lang="ts">
import { IonPage } from "@ionic/vue";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useMaps } from "@/store/maps";
import { useCoords } from "@/store/coords";
import icon from "@/assets/pin.png";

const mapsStore = useMaps();
const coordsStore = useCoords();

</script>

<template>
  <IonPage class="relative items-center justify-center pointer-events-none">
    <div class="home-page">home page</div>
  </IonPage>
</template>
