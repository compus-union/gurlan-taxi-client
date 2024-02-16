import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useDestination = defineStore("destination-store", () => {
  const id = ref("destination-store");
  const lat = ref<number>(0);
  const lng = ref<number>(0);

  const coords = computed(() => {
    return { lat: lat.value, lng: lng.value };
  });

  async function changeCoords(
    payload: { lat: number; lng: number },
    type: "return" | "void"
  ) {
    lat.value = payload.lat;
    lng.value = payload.lng;

    if (type === "return") {
      return { lat: lat.value, lng: lng.value };
    }
  }

  return { changeCoords, coords, lat, lng };
});
