import { defineStore, storeToRefs } from "pinia";
import { useOriginCoords } from "./origin";
import { useDestination } from "./destination";
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
  const mapMoving = ref(false);
  const destinationStore = useDestination();

  const { coords: originCoords } = storeToRefs(originStore);
  const { coords: destinationCoords } = storeToRefs(destinationStore);

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

      return;
    } catch (error) {
      return error;
    }
  }

  async function addOriginMarker() {
    try {
      // get fixed marker of origin marker
      const originMarkerFixed = markers.value.find((m: any) => {
        return m._custom_id === "origin-marker-fixed";
      }) as CustomMarker;

      // if it exists, remove it
      if (originMarkerFixed) {
        sharedMap.value?.removeLayer(originMarkerFixed);
        markers.value = markers.value.filter(
          (m) => m._custom_id !== "origin-marker-fixed"
        );
      }

      // check if origin marker already exists
      let originMarker = markers.value.find(
        (m: any) => m._custom_id === "origin-marker"
      ) as CustomMarker;

      // if doesn't exists, add it
      if (!originMarker) {
        const originMarkerIcon = leaflet.icon({
          iconUrl: "./assets/origin-marker-icon.svg",
          iconSize: [25, 41],
        });
        originMarker = leaflet
          .marker([originCoords.value.lat, originCoords.value.lng], {
            icon: originMarkerIcon,
          })
          .addTo(sharedMap.value as Map | LayerGroup<any>);

        originMarker._custom_id = "origin-marker";
        markers.value.push(originMarker as CustomMarker);
        return;
      }
    } catch (error) {
      alert(error);
    }
  }

  async function initialiseEvents() {
    try {
      sharedMap.value?.addEventListener("move", async (e) => {
        mapMoving.value = true;
        const lat = sharedMap.value?.getCenter().lat as number;
        const lng = sharedMap.value?.getCenter().lng as number;

        originMarker
          .setLatLng([lat, lng])
          .addTo(sharedMap.value as Map | LayerGroup<any>);
      });
      sharedMap.value?.addEventListener("zoom", async (e) => {
        mapMoving.value = true;

        const lat = sharedMap.value?.getCenter().lat as number;
        const lng = sharedMap.value?.getCenter().lng as number;

        originMarker
          .setLatLng([lat, lng])
          .addTo(sharedMap.value as Map | LayerGroup<any>);
      });

      sharedMap.value?.addEventListener("zoomend", async (e) => {
        mapMoving.value = false;

        const lat = sharedMap.value?.getCenter().lat as number;
        const lng = sharedMap.value?.getCenter().lng as number;
        await originStore.changeCoords({ lat, lng });
      });
      sharedMap.value?.addEventListener("dragend", async (e) => {
        mapMoving.value = false;

        const lat = sharedMap.value?.getCenter().lat as number;
        const lng = sharedMap.value?.getCenter().lng as number;
        await originStore.changeCoords({ lat, lng });
      });
      sharedMap.value?.addEventListener("moveend", async (e) => {
        mapMoving.value = false;

        const lat = sharedMap.value?.getCenter().lat as number;
        const lng = sharedMap.value?.getCenter().lng as number;
        await originStore.changeCoords({ lat, lng });
      });
    } catch (error) {
      alert(error);
    }
  }

  async function addDestinationMarker() {
    try {
      // get fixed marker of destination marker
      const destinationMarkerFixed = markers.value.find(
        (m: any) => m._custom_id === "destination-marker-fixed"
      ) as CustomMarker;

      // if it exists, remove it
      if (destinationMarkerFixed) {
        sharedMap.value?.removeLayer(destinationMarkerFixed);
        markers.value = markers.value.filter(
          (m) => m._custom_id !== "destination-marker-fixed"
        );
      }

      // check if destination marker already exists
      let destinationMarker = markers.value.find(
        (m: any) => m._custom_id === "destination-marker"
      ) as CustomMarker;

      // if doesn't exists, add it
      if (!destinationMarker) {
        const destinationIcon = leaflet.icon({
          iconUrl: "./assets/destination-marker.svg",
          iconSize: [25, 41],
        });

        destinationMarker = leaflet
          .marker(
            [
              destinationCoords.value.lat
                ? destinationCoords.value.lat
                : originCoords.value.lat,
              destinationCoords.value.lng
                ? destinationCoords.value.lng
                : originCoords.value.lng,
            ],
            {
              icon: destinationIcon,
            }
          )
          .addTo(sharedMap.value as Map | LayerGroup<any>);

        destinationMarker._custom_id = "origin-marker";
        markers.value.push(destinationMarker as CustomMarker);

        destinationMarker._custom_id = "destination-marker";
        markers.value.push(destinationMarker);

        return;
      }
    } catch (error) {
      alert(error);
    }
  }

  return {
    loadMap,
    setMap,
    sharedMap,
    markers,
    defaultZoom,
    mapMoving,
    initialiseEvents,
  };
});
