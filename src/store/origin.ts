import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { Geolocation } from "@capacitor/geolocation";
import router from "@/router";
import { loadingController } from "@ionic/vue";
import { toast } from "vue3-toastify";
import { CustomMarker, useMaps } from "./maps";
import { LayerGroup, Map } from "leaflet";

export const useOriginCoords = defineStore("coords-store", () => {
  const lat = ref<number>(0);
  const lng = ref<number>(0);
  const watchingCoords = ref<boolean>(true);

  async function getCoordsWithNavigator(): Promise<void> {
    const loading = await loadingController.create({
      message: "Joylashuvingiz aniqlanmoqda...",
    });
    try {
      await loading.present();

      navigator.geolocation.getCurrentPosition(
        (results) => {
          lat.value = results.coords.latitude;
          lng.value = results.coords.longitude;
          return { coords };
        },
        (err) => {
          if (err) {
            console.log(err);

            toast("Joylashuvni aniqlashni iloji bo'lmadi");
            return;
          }
        }
      );
    } catch (error: any) {
      toast(error);
    } finally {
      await loading.dismiss();
    }
  }

  async function getCoords() {
    try {
      const results = await Geolocation.getCurrentPosition();

      await changeCoords({
        lat: results.coords.latitude,
        lng: results.coords.longitude,
      });

      console.log(lat.value, lng.value);

      return { coords: results.coords };
    } catch (error: any) {
      if (error.message === "location disabled") {
        return router.push({ path: "/no-gps" });
      }
      alert(error.message);
    }
  }

  async function watchCoords(): Promise<void> {
    try {
      if (watchingCoords.value) {
        await Geolocation.watchPosition({}, (results) => {
          lat.value = results?.coords.latitude as number;
          lng.value = results?.coords.longitude as number;

          console.log("Moved to new location");
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
    lat,
    lng,
    watchingCoords,
  };
});
