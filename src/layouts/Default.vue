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
  toastController,
} from "@ionic/vue";
import { useRouter } from "vue-router";
import { onBeforeMount, onMounted, ref } from "vue";
import { useMaps } from "@/store/maps";
import { useCoords } from "@/store/coords";
import MarkerIcon from "@/assets/pin.png";

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

onMounted(async () => {
  const loading = await loadingController.create({
    message: "Xarita yuklanmoqda...",
  });
  try {
    await loading.present();
    await mapsStore.loadMap("map");
  } catch (error: any) {
    const toast = await toastController.create({
      message: error.message,
      duration: 4000,
    });
    await toast.present();
  } finally {
    await loading.dismiss();
  }
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
              Bonus: 45,000 so'm</IonTitle
            >
          </IonToolbar>
        </IonHeader>
        <IonRouterOutlet contentId="my-content"></IonRouterOutlet>
        <IonContent>
          <div id="map" class="h-[100vh] w-full relative"></div>
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
