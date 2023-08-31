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
  IonSplitPane,
  IonTitle,
  IonToolbar,
  loadingController,
  toastController,
} from "@ionic/vue";
import { useRouter } from "vue-router";
import { onBeforeMount, onMounted } from "vue";
import { useMaps } from "@/store/maps";
import { useAuth } from "@/store/auth";

const router = useRouter();
const mapsStore = useMaps();
const authStore = useAuth();

onBeforeMount(async () => {
  const { value: token } = await Preferences.get({ key: "auth_token" });
  const { value: oneId } = await Preferences.get({ key: "clientOneId" });

  if (
    (oneId === "undefined" && token === "undefined") ||
    (!oneId && !token) ||
    (oneId === "null" && token === "null")
  ) {
    await Preferences.remove({ key: "clientOneId" });
    await Preferences.remove({ key: "auth_token" });

    router.push("/register");

    return {
      status: "forbidden",
    };
  }

  const check = await authStore.check();

  if (check?.status === "ok") {
    return;
  }

  router.push("/register");

  console.log(check);
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

      <div class="ion-page font-bricolage flex" id="my-content">
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
        <IonContent class="fixed inset-0">
          <div id="map" class="h-[100vh] w-full"></div>
        </IonContent>
        <div
          class="ion-content fixed w-full border-t z-[99999] bg-transparent h-auto bottom-0 rounded-t-lg shadow"
        >
          <slot></slot>
        </div>
      </div>
    </IonSplitPane>
  </IonPage>
</template>

<style scoped>
.ion-content {
  background-color: var(--ion-background-color);
}
ion-menu::part(backdrop) {
  background-color: rgba(0, 0, 0, 0.694);
}

img[alt="Google"] {
  display: none;
}

div.gmnoprint {
  display: none;
}
</style>
