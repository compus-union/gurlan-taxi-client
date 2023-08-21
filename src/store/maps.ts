import { defineStore } from "pinia";
import { Loader } from "@googlemaps/js-api-loader";
import config from "@/config";
import { ref } from "vue";

const loader = new Loader({
  apiKey: config.GOOGLE_MAPS_API_KEY,
  version: "weekly",
});

export const useMaps = defineStore("maps-store", () => {
  const sharedMap = ref<google.maps.Map>();

  async function setMap(payload: google.maps.Map) {
    sharedMap.value = payload;
    return;
  }

  async function loadMap() {
    const { Map } = (await loader.importLibrary(
      "maps"
    )) as google.maps.MapsLibrary;

    return {
      Map,
    };
  }

  return {
    loadMap,
    setMap,
    sharedMap,
  };
});
