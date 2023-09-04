<script lang="ts" setup>
import { IonPage } from "@ionic/vue";
import NoInternetImg from "@/assets/wifi.png";
</script>

<template>
  <IonPage>
    <div
      class="flex flex-col container mx-auto h-[100dvh] text-center items-center justify-center"
    >
      <div class="content-img w-[20%]">
        <img class="w-full" :src="NoInternetImg" alt="no internet" />
      </div>
      <div class="content-text my-3">
        <h1 class="font-bricolage text-xl font-bold">
          Internet bilan aloqa uzilgan.
        </h1>
        <p class="font-roboto opacity-60 mt-4">
          Internetingiz ishlayotganligiga ishonch hosil qiling va dasturdan
          chiqib boshqatdan kirib ko'ring.
        </p>
      </div>
    </div>
  </IonPage>
</template>

<style scoped></style>
