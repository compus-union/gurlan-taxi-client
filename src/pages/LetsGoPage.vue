<script setup lang="ts">
import { ChevronLeft } from "lucide-vue-next";
import { defineAsyncComponent, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const Button = defineAsyncComponent(
  () => import("@/components/ui/button/Button.vue")
);

async function goBack() {
  await router.push("/side/setDestination");
}

type RideTaxi = "taxi" | "delivery";

const rideType = ref<RideTaxi>("taxi");
</script>

<template>
  <div class="letsgo-page h-auto flex flex-col">
    <Button @click="goBack" class="mb-4 justify-self-end self-end mr-4"
      ><ChevronLeft class="w-4 h-4 mr-2" /> Orqaga</Button
    >
    <div
      class="main-content bg-primary-foreground text-foreground p-6 custom-style"
    >
      <div class="ride-type-buttons flex items-center justify-start space-x-3">
        <Button
          class="px-4"
          :class="{ 'border border-black': rideType === 'taxi' }"
          variant="secondary"
          >Taxi</Button
        >
        <Button
          class="px-4"
          :class="{ 'border border-black': rideType === 'delivery' }"
          variant="secondary"
          >Yetkazib berish</Button
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-style {
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -8px 8px -2px rgba(0, 0, 0, 0.2);
}
</style>
