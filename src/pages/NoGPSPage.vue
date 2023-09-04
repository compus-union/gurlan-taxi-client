<script lang="ts" setup>
import { IonPage } from "@ionic/vue";
import NoLocationImg from "@/assets/location.png";
</script>

<template>
  <IonPage>
    <div
      class="flex flex-col container mx-auto h-[100dvh] text-center items-center justify-center"
    >
      <div class="content-img w-[20%]">
        <img class="w-full" :src="NoLocationImg" alt="no location" />
      </div>
      <div class="content-text my-3">
        <h1 class="font-bricolage text-xl font-bold">GPS o'chiq</h1>
        <p class="font-roboto opacity-60 mt-4">
          Qurilmangizda GPS bilan aloqa o'rnatilganligiga ishonch hosil qilib,
          dasturga boshqatdan kirib ko'ring.
        </p>
      </div>
    </div>
  </IonPage>
</template>

<style scoped></style>
