import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useCoords = defineStore("coords-store", () => {
  const lat = ref<number>(0);
  const lng = ref<number>(0);

  async function getCoords() {
    navigator.geolocation.getCurrentPosition(
      (result) => {
        lat.value = result.coords.latitude;
        lng.value = result.coords.longitude;
        console.log("hey, there some changes");
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
