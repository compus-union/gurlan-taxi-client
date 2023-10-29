import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { Geolocation } from "@capacitor/geolocation";
import router from "@/router";

export const useOriginCoords = defineStore("coords-store", () => {
  const lat = ref<number>(0);
  const lng = ref<number>(0);

  const watchingCoords = ref<boolean>(true);

  async function getCoordsWithNavigator(): Promise<void> {
    //  set up loading
    try {
      // show loading
      navigator.geolocation.getCurrentPosition(
        (results) => {
          lat.value = results.coords.latitude;
          lng.value = results.coords.longitude;
          alert(`${results.coords.latitude} ${results.coords.longitude}`);

          return { coords };
        },
        (err) => {
          if (err) {
            alert(err.message);
          }
        }
      );
    } catch (error) {
      alert(error);
      // use own toast instead of `alert`
    } finally {
      // dismiss loading
    }
  }

  async function getCoords() {
    try {
      const results = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
      });

      lat.value = results.coords.latitude;
      lng.value = results.coords.longitude;

      return { coords: results.coords };
    } catch (error: any) {
      alert(error.message);
    }
  }

  async function watchCoords(): Promise<void> {
    try {
      if (watchingCoords.value) {
        await Geolocation.watchPosition({}, (results) => {
          lat.value = results?.coords.latitude as number;
          lng.value = results?.coords.longitude as number;
        });
        console.log("watch coords enabled");

        return;
      }

      console.log("watch coords disabled");
    } catch (error) {
      router.push("/no-gps");
    }
  }

  async function changeCoords(coords: {
    lat: number;
    lng: number;
  }): Promise<void> {
    watchingCoords.value = false;
    lat.value = coords.lat;
    lng.value = coords.lng;
  }

  const coords = computed(() => {
    return { lat: lat.value, lng: lng.value };
  });

  return {
    coords,
    getCoords,
    watchCoords,
    changeCoords,
    getCoordsWithNavigator,
  };
});
