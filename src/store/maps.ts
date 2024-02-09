import { defineStore, storeToRefs } from "pinia";
import config from "@/config";
import { useOriginCoords } from "./origin";
import { ref } from "vue";
import leaflet from "leaflet";
import { LayerGroup, Map } from "leaflet";

export interface CustomMarker extends leaflet.Marker {
  latLng?: leaflet.LatLng;
  _custom_id?: string;
}

export const useMaps = defineStore("maps-store", () => {
  const sharedMap = ref<leaflet.Map>();
  const originStore = useOriginCoords();
  const markers = ref<CustomMarker[]>([]);
  const defaultZoom = ref(16);

  const { coords: originCoords } = storeToRefs(originStore);

  async function setMap(payload: leaflet.Map) {
    sharedMap.value = payload;
    return;
  }

  async function loadMap(id: string) {
    try {
      // get origin coords, where user is located
      await Promise.allSettled([
        originStore.getCoords(),
        originStore.watchCoords(),
      ]);

      // initalise the map
      sharedMap.value = leaflet
        .map(id, { zoomControl: false, maxZoom: 20, attributionControl: false })
        .setView(
          [originCoords.value.lat, originCoords.value.lng],
          defaultZoom.value
        );

      // add layers to the map
      leaflet
        .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 20,
        })
        .addTo(sharedMap.value);

      // add origin marker to the map
      const originMarker = leaflet
        .marker([originCoords.value.lat, originCoords.value.lng], {})
        .addTo(sharedMap.value);

      // @ts-ignore
      originMarker._custom_id = "origin-marker";
      markers.value.push(originMarker as CustomMarker);
      console.log(markers.value);

      async function moveEvent() {
        sharedMap.value?.addEventListener("move", async (e) => {
          const lat = sharedMap.value?.getCenter().lat as number;
          const lng = sharedMap.value?.getCenter().lng as number;

          originMarker
            .setLatLng([lat, lng])
            .addTo(sharedMap.value as Map | LayerGroup<any>);
        });
        sharedMap.value?.addEventListener("zoom", async (e) => {
          const lat = sharedMap.value?.getCenter().lat as number;
          const lng = sharedMap.value?.getCenter().lng as number;

          originMarker
            .setLatLng([lat, lng])
            .addTo(sharedMap.value as Map | LayerGroup<any>);
        });

        sharedMap.value?.addEventListener("zoomend", async (e) => {
          const lat = sharedMap.value?.getCenter().lat as number;
          const lng = sharedMap.value?.getCenter().lng as number;
          await originStore.changeCoords({ lat, lng });
        });
        sharedMap.value?.addEventListener("dragend", async (e) => {
          const lat = sharedMap.value?.getCenter().lat as number;
          const lng = sharedMap.value?.getCenter().lng as number;
          await originStore.changeCoords({ lat, lng });
        });
      }

      await moveEvent();
      return;
    } catch (error) {
      return error;
    }
  }

  return {
    loadMap,
    setMap,
    sharedMap,
    markers,
    defaultZoom,
  };
});
