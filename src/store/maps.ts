import { defineStore } from "pinia";
import config from "@/config";
import { useOriginCoords } from "./origin";
import { ref } from "vue";
import leaflet from "leaflet";

export const useMaps = defineStore("maps-store", () => {
  const sharedMap = ref<leaflet.Map>();
  const originStore = useOriginCoords();
  const markers = ref([]);

  async function setMap(payload: leaflet.Map) {
    sharedMap.value = payload;
    return;
  }

  async function loadMap(id: string) {
    try {
      await Promise.allSettled([
        originStore.getCoords(),
        originStore.watchCoords(),
      ]);

      async function initialiseMap() {
        sharedMap.value = leaflet
          .map(id, { zoomControl: false })
          .setView([originStore.coords.lat, originStore.coords.lng], 17, {
            animate: true,
          });
      }

      async function initialiseLayer() {
        if (sharedMap.value)
          leaflet
            .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
              maxZoom: 19,
            })
            .addTo(sharedMap.value);
      }

      async function initialiseOriginMarker() {
        if (sharedMap.value)
          leaflet
            .marker([originStore.coords.lat, originStore.coords.lng], {})
            .addTo(sharedMap.value);
      }

      await initialiseMap();
      await initialiseLayer();
      await initialiseOriginMarker();

      return;
    } catch (error) {
      alert(error);
    }
  }

  async function attachMoveChangingEvents() {
    try {
      async function moveEndEvent() {
        sharedMap.value?.addEventListener("move", async (e) => {
          const lat = sharedMap.value?.getCenter().lat as number;
          const lng = sharedMap.value?.getCenter().lng as number;

          await originStore.changeCoords({ lat, lng });

          alert(`${lat} ${lng}`)
        });

      }
      await moveEndEvent();
    } catch (error) {
      alert(error);
    }
  }

  return {
    loadMap,
    attachMoveChangingEvents, 
    setMap,
    sharedMap,
    markers,
  };
});
