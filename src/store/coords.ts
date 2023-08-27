import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { Geolocation } from "@capacitor/geolocation";
import router from "@/router";

export const useCoords = defineStore("coords-store", () => {
  const lat = ref<number>(0);
  const lng = ref<number>(0);

  async function getCoordsWithNavigator(): Promise<void> {
    try {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {

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
      const results = await Geolocation.getCurrentPosition();

      lat.value = results.coords.latitude;
      lng.value = results.coords.longitude;

      return { coords: results.coords };
    } catch (error: any) {
      router.push("/no-gps");
    }
  }

  async function watchCoords(): Promise<void> {
    try {
      await Geolocation.watchPosition({}, (results) => {
        lat.value = results?.coords.latitude as number;
        lng.value = results?.coords.longitude as number;
      });
    } catch (error) {
      router.push("/no-gps");
    }
  }

  async function changeCoords(coords: {
    lat: number;
    lng: number;
  }): Promise<void> {
    lat.value = coords.lat;
    lng.value = coords.lng;
  }

  const coords = computed(() => {
    return { lat: lat.value, lng: lng.value };
  });

  return { coords, getCoords, watchCoords, changeCoords };
});
