<script setup lang="ts">
import { useGeocoding } from "@/store/geocoding";
import { storeToRefs } from "pinia";
import { defineAsyncComponent, onBeforeUnmount } from "vue";

const Button = defineAsyncComponent(() => import("@/components/ui/button/Button.vue"));

const geocodingStore = useGeocoding();

const { originAddress } = storeToRefs(geocodingStore); 

onBeforeUnmount(async () => {
  // Remove event listeners when the component is unmounted to prevent memory leaks
  alert("unmounted: SetDestinationPage");
});
</script>

<template>
  <div class="set-destination-page h-auto flex flex-col">
    <div
      class="main-content bg-primary-foreground text-foreground p-6 custom-style"
    >
      <h1 class="text-primary">
        {{ originAddress?.displayName || originAddress?.name }}
      </h1>
      <Button @click="() => $router.push('/ride/setOrigin')">Go back</Button>
    </div>
  </div>
</template>
