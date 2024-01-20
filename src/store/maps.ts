import { defineStore } from "pinia";
import config from "@/config";
import { useOriginCoords } from "./origin";
import { ref } from "vue";
// import leaflet from "leaflet";
// const map = leaflet.map("map").setView([51.505, -0.09], 13);

export const useMaps = defineStore("maps-store", () => {
  const sharedMap = ref<google.maps.Map>();
  const originStore = useOriginCoords();
  const markers = ref([]);

  async function setMap(payload: google.maps.Map) {
    sharedMap.value = payload;
    return;
  }

  async function loadMap(id: string) {
    try {
      await originStore.getCoords();
      await originStore.watchCoords();
    } catch (error) {
      alert(error);
    }
  }

  return {
    loadMap,
    setMap,
    sharedMap,
    markers,
  };
});
