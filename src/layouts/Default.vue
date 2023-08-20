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
} from "@ionic/vue";
import { useRouter } from "vue-router";
import { onBeforeMount } from "vue";

const router = useRouter();

onBeforeMount(async () => {
  const { value: auth_token } = await Preferences.get({ key: "auth_token" });
  const { value: clientOneId } = await Preferences.get({ key: "clientOneId" });

  if (auth_token && clientOneId) {
    return;
  }

  router.push("/register");
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
      </div>
    </IonSplitPane>
  </IonPage>
</template>

<style>
ion-menu::part(backdrop) {
  background-color: rgba(0, 0, 0, 0.694);
}
</style>
