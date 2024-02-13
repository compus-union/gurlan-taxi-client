<script setup lang="ts">
import { useGeocoding } from "@/store/geocoding";
import { storeToRefs } from "pinia";

const geocodingStore = useGeocoding();

const { originAddress } = storeToRefs(geocodingStore); 
</script>

<template>
  <div class="set-destination-page h-auto flex flex-col">
    <div
      class="main-content bg-primary-foreground text-foreground p-6 custom-style"
    >
      <h1 class="text-primary">
        {{ originAddress?.displayName || originAddress?.name }}
      </h1>
    </div>
  </div>
</template>
