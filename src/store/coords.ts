import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { Geolocation } from "@capacitor/geolocation";
import router from "@/router";

export const useCoords = defineStore("coords-store", () => {
  const lat = ref<number>(0);
  const lng = ref<number>(0);

  async function getCoordsWithNavigator() {
    try {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          console.log(coords);
          
          return { coords };
        },
        (err) => {
          if (err.message) {
            throw new Error(err.message);
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  async function getCoords() {
    try { 
      const resultsN = await getCoordsWithNavigator();

      const results = await Geolocation.getCurrentPosition();

      lat.value = results.coords.latitude;
      lng.value = results.coords.longitude;

      return { coords: results.coords };
    } catch (error: any) {
      router.push("/no-gps");
    }
  }

  async function watchCoords() {
    try {
      await Geolocation.watchPosition({}, (results) => {
        lat.value = results?.coords.latitude as number;
        lng.value = results?.coords.longitude as number;
      });
    } catch (error) {
      router.push("/no-gps");
    }
  }

  const coords = computed(() => {
    return { lat: lat.value, lng: lng.value };
  });

  return { coords, getCoords, watchCoords };
});
