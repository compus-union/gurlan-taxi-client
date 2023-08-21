import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { Geolocation } from "@capacitor/geolocation";

export const useCoords = defineStore("coords-store", () => {
  const lat = ref<number>(0);
  const lng = ref<number>(0);

  async function getCoords() {
    navigator.geolocation.getCurrentPosition(
      (result) => {
        lat.value = result.coords.latitude;
        lng.value = result.coords.longitude;
        alert(`${lat.value} ${lng.value}`);
      },
      (err) => {
        console.log(err);
      },
      { enableHighAccuracy: true }
    );
  }

  const coords = computed(() => {
    return { lat: lat.value, lng: lng.value };
  });

  return { coords, getCoords };
});
