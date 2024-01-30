<script lang="ts" setup>
import NoLocationImg from "@/assets/location.png";
import CatSad from "@/components/custom-illustrations/CatSad.vue";
</script>

<template>
  <div class="h-screen flex flex-col items-center justify-center">
    <div class="img w-[70%]">
      <CatSad class="w-full" />
    </div>
    <div class="content text-center px-4">
      <h1 class="title text-3xl font-bold text-primary">GPS o'chirilgan</h1>
      <p class="description mt-2">
        Qurilmangizda GPS ni yoqib, dasturni boshqatdan ishga tushiring.
      </p>
    </div>
  </div>
</template>

<style scoped></style>
