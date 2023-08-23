<script setup lang="ts">
import { IonPage, IonButton, IonButtons, IonIcon } from "@ionic/vue";
import { locateOutline, locationOutline } from "ionicons/icons";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useMaps } from "@/store/maps";
import { useCoords } from "@/store/coords";
import icon from "@/assets/pin.png";
import Default from "@/layouts/Default.vue";

const mapsStore = useMaps();
const coordsStore = useCoords();
</script>

<template>
  <Default>
    <div class="flex items-center justify-center h-auto">
      <div class="home-page w-full flex flex-col justify-between p-4 space-y-4">
        <IonButton fill="outline"
          ><ion-icon class="mr-4" slot="start" :icon="locateOutline"></ion-icon>
          Joylashuvimni ko'rsat</IonButton
        >
        <IonButton
        color="primary"
          ><ion-icon
            class="mr-4"
            slot="start"
            :icon="locationOutline"
          ></ion-icon>
          Qayerga boramiz?</IonButton
        >
      </div>
    </div>
  </Default>
</template>
