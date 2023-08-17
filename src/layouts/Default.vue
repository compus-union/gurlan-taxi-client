<script setup lang="ts">
import { Preferences } from "@capacitor/preferences";
import { IonPage, toastController } from "@ionic/vue";
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
  <IonPage> </IonPage>
</template>
