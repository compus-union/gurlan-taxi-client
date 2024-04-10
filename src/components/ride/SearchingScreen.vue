<script setup lang="ts">
import { Button as MainButton } from "@/components/ui/button";
import { Ban } from "lucide-vue-next";
</script>

<template>
  <div
    class="main-content bg-primary-foreground text-center text-foreground p-6 custom-style"
  >
    <h1 class="text-foreground font-poppins font-bold text-xl mb-2">
      Siz uchun taxi izlayabmiz...
    </h1>
    <p class="text-foreground font-manrope">
      Eng yaqin haydovchi sizga javob beradi.
    </p>
    <MainButton class="py-6 text-lg font-manrope w-full mt-4"
      ><Ban class="mr-2" /> Bekor qilish</MainButton
    >
  </div>
</template>

<style scoped>
.custom-style {
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -8px 8px -2px rgba(0, 0, 0, 0.2);
}
</style>
