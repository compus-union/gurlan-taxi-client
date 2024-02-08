<script setup lang="ts">
import { useGeocoding } from "@/store/geocoding";
import { useMaps } from "@/store/maps";
import { useLoading } from "@/store/loading";
import { storeToRefs } from "pinia";

const geocodingStore = useGeocoding();
const mapsStore = useMaps();
const loadingStore = useLoading();

const { destinationAddress } = storeToRefs(geocodingStore);
const { sharedMap, markers } = storeToRefs(mapsStore);
const { loading } = storeToRefs(loadingStore);
</script>

<template>
  <div class="reverse-geocoding">
    <p>Sizning manzilingiz:</p>
    <h3>Address, goes here, 23</h3>
  </div>
</template>
