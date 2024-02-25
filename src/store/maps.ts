import { defineStore, storeToRefs } from "pinia";
import { useOriginCoords } from "./origin";
import { useDestination } from "./destination";
import { ref } from "vue";
import leaflet from "leaflet";
import { LayerGroup, Map } from "leaflet";
import { useRoute } from "vue-router";
import OriginMarkerIcon from "@/assets/origin-marker-icon.svg";
import DestinationMarkerIcon from "@/assets/destination-marker-icon.svg";
import RealLocationPointIcon from "@/assets/real-location-point.svg";

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
  const route = useRoute();
  const mapLoaded = ref(false);

  const { coords: originCoords } = storeToRefs(originStore);
  const { coords: destinationCoords } = storeToRefs(destinationStore);

  async function setMap(payload: leaflet.Map) {
    sharedMap.value = payload;
    return;
  }

  async function loadMap(id: string) {
    try {
      // get origin coords, where user is located
      await originStore.getCoords();
      await originStore.watchCoords();

      // initalise the map
      if (originCoords.value) {
        sharedMap.value = leaflet
          .map(id, {
            zoomControl: false,
            maxZoom: 20,
            attributionControl: false,
          })
          .setView(
            [originCoords.value.lat, originCoords.value.lng],
            defaultZoom.value
          );

        // add layers to the map
        leaflet
          .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 20,
          })
          .addTo(sharedMap.value)
          .on("load", () => {
            mapLoaded.value = true;
          });

        let originMarker = markers.value.find(
          (m) => m._custom_id === "origin-marker"
        ) as CustomMarker;

        let destinationMarker = markers.value.find(
          (m) => m._custom_id === "destination-marker"
        ) as CustomMarker;

        let realLocationPoint = markers.value.find(
          (m) => m._custom_id === "real-location-point"
        ) as CustomMarker;

        if (!realLocationPoint) {
          const realLocationPointIcon = leaflet.icon({
            iconUrl: RealLocationPointIcon,
            iconSize: [20, 20],
          });

          const realLocationPoint = leaflet
            .marker([originCoords.value.lat, originCoords.value.lng], {
              icon: realLocationPointIcon,
            })
            .addTo(sharedMap.value) as CustomMarker;

          realLocationPoint._custom_id = "real-location-point";
          markers.value.push(realLocationPoint);
        }

        if (!originMarker && route.path === "/ride/setOrigin") {
          console.log("origin marker is being added in loadMap()");
          await addOriginMarker();
        }

        if (!destinationMarker && route.path === "/ride/setDestination") {
          console.log("destination marker is being added in loadMap*()");
          await addDestinationMarker();
        }

        return;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function initialiseEvents() {
    try {
      // get origin marker

      sharedMap.value?.addEventListener("move", async (e) => {
        let originMarker = markers.value.find(
          (m) => m._custom_id === "origin-marker"
        ) as CustomMarker;

        let destinationMarker = markers.value.find(
          (m) => m._custom_id === "destination-marker"
        ) as CustomMarker;
        if (route.path === "/ride/letsgo") return;

        mapMoving.value = true;
        const lat = sharedMap.value?.getCenter().lat as number;
        const lng = sharedMap.value?.getCenter().lng as number;

        if (route.path === "/ride/setOrigin") {
          originMarker
            .setLatLng([lat, lng])
            .addTo(sharedMap.value as Map | LayerGroup<any>);
          return;
        }

        if (route.path === "/ride/setDestination") {
          destinationMarker
            .setLatLng([lat, lng])
            .addTo(sharedMap.value as Map | LayerGroup<any>);
          return;
        }
      });
      sharedMap.value?.addEventListener("zoom", async (e) => {
        let originMarker = markers.value.find(
          (m) => m._custom_id === "origin-marker"
        ) as CustomMarker;

        let destinationMarker = markers.value.find(
          (m) => m._custom_id === "destination-marker"
        ) as CustomMarker;
        if (route.path === "/ride/letsgo") return;

        mapMoving.value = true;
        const lat = sharedMap.value?.getCenter().lat as number;
        const lng = sharedMap.value?.getCenter().lng as number;

        if (route.path === "/ride/setOrigin") {
          originMarker
            .setLatLng([lat, lng])
            .addTo(sharedMap.value as Map | LayerGroup<any>);
          return;
        }

        if (route.path === "/ride/setDestination") {
          destinationMarker
            .setLatLng([lat, lng])
            .addTo(sharedMap.value as Map | LayerGroup<any>);
          return;
        }
      });

      sharedMap.value?.addEventListener("zoomend", async (e) => {
        let originMarker = markers.value.find(
          (m) => m._custom_id === "origin-marker"
        ) as CustomMarker;

        let destinationMarker = markers.value.find(
          (m) => m._custom_id === "destination-marker"
        ) as CustomMarker;
        if (route.path === "/ride/letsgo") return;

        mapMoving.value = false;
        const lat = sharedMap.value?.getCenter().lat as number;
        const lng = sharedMap.value?.getCenter().lng as number;

        if (route.path === "/ride/setOrigin") {
          await originStore.changeCoords({ lat, lng });

          originMarker
            .setLatLng([lat, lng])
            .addTo(sharedMap.value as Map | LayerGroup<any>);
          return;
        }

        if (route.path === "/ride/setDestination") {
          await destinationStore.changeCoords({ lat, lng }, "void");
          destinationMarker
            .setLatLng([lat, lng])
            .addTo(sharedMap.value as Map | LayerGroup<any>);
          return;
        }
      });
      sharedMap.value?.addEventListener("dragend", async (e) => {
        let originMarker = markers.value.find(
          (m) => m._custom_id === "origin-marker"
        ) as CustomMarker;

        let destinationMarker = markers.value.find(
          (m) => m._custom_id === "destination-marker"
        ) as CustomMarker;
        if (route.path === "/ride/letsgo") return;

        mapMoving.value = false;
        const lat = sharedMap.value?.getCenter().lat as number;
        const lng = sharedMap.value?.getCenter().lng as number;

        if (route.path === "/ride/setOrigin") {
          await originStore.changeCoords({ lat, lng });

          originMarker
            .setLatLng([lat, lng])
            .addTo(sharedMap.value as Map | LayerGroup<any>);
          return;
        }

        if (route.path === "/ride/setDestination") {
          await destinationStore.changeCoords({ lat, lng }, "void");
          destinationMarker
            .setLatLng([lat, lng])
            .addTo(sharedMap.value as Map | LayerGroup<any>);
          return;
        }
      });
      sharedMap.value?.addEventListener("moveend", async (e) => {
        let originMarker = markers.value.find(
          (m) => m._custom_id === "origin-marker"
        ) as CustomMarker;

        let destinationMarker = markers.value.find(
          (m) => m._custom_id === "destination-marker"
        ) as CustomMarker;
        if (route.path === "/ride/letsgo") return;

        mapMoving.value = false;
        const lat = sharedMap.value?.getCenter().lat as number;
        const lng = sharedMap.value?.getCenter().lng as number;

        if (route.path === "/ride/setOrigin") {
          await originStore.changeCoords({ lat, lng });

          originMarker
            .setLatLng([lat, lng])
            .addTo(sharedMap.value as Map | LayerGroup<any>);
          return;
        }

        if (route.path === "/ride/setDestination") {
          await destinationStore.changeCoords({ lat, lng }, "void");
          destinationMarker
            .setLatLng([lat, lng])
            .addTo(sharedMap.value as Map | LayerGroup<any>);
          return;
        }
      });
    } catch (error) {
      console.log(error);
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
          iconUrl: OriginMarkerIcon,
          iconSize: [44, 60],
          iconAnchor: [22, 60],
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
      console.log(error);
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
          iconUrl: DestinationMarkerIcon,
          iconSize: [44, 60],
          iconAnchor: [22, 60],
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

        destinationMarker._custom_id = "destination-marker";
        markers.value.push(destinationMarker as CustomMarker);

        return;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function addFixedOriginMarker() {
    try {
      const originMarker = markers.value.find(
        (m) => m._custom_id === "origin-marker"
      ) as CustomMarker;

      if (originMarker) {
        sharedMap.value?.removeLayer(originMarker);
        markers.value = markers.value.filter(
          (m) => m._custom_id !== "origin-marker"
        );
      }

      const originMarkerIcon = leaflet.icon({
        iconUrl: OriginMarkerIcon,
        iconSize: [44, 60],
        iconAnchor: [22, 60],
      });

      const fixedOriginMarker = leaflet
        .marker([originCoords.value.lat, originCoords.value.lng], {
          icon: originMarkerIcon,
        })
        .addTo(sharedMap.value as Map) as CustomMarker;

      fixedOriginMarker._custom_id = "origin-marker-fixed";
      markers.value.push(fixedOriginMarker);
      return;
    } catch (error) {
      console.log(error);
    }
  }

  async function addFixedDestinationMarker() {
    try {
      const destinationMarker = markers.value.find(
        (m) => m._custom_id === "destination-marker"
      ) as CustomMarker;

      if (destinationMarker) {
        sharedMap.value?.removeLayer(destinationMarker);
        markers.value = markers.value.filter(
          (m) => m._custom_id !== "destination-marker"
        );
      }

      const destinationIcon = leaflet.icon({
        iconUrl: DestinationMarkerIcon,
        iconSize: [44, 60],
        iconAnchor: [22, 60],
      });

      const fixedDestinationMarker = leaflet
        .marker(
          [
            destinationCoords.value.lat
              ? destinationCoords.value.lat
              : originCoords.value.lat,
            destinationCoords.value.lng
              ? destinationCoords.value.lng
              : originCoords.value.lng,
          ],
          { icon: destinationIcon }
        )
        .addTo(sharedMap.value as Map) as CustomMarker;

      fixedDestinationMarker._custom_id = "destination-marker-fixed";
      markers.value.push(fixedDestinationMarker);
      return;
    } catch (error) {
      console.log(error);
    }
  }

  async function removeDestinationMarker() {
    try {
      const destinationMarker = markers.value.find(
        (m) => m._custom_id === "destination-marker"
      ) as CustomMarker;

      if (destinationMarker) {
        sharedMap.value?.removeLayer(destinationMarker);
        markers.value = markers.value.filter(
          (m) => m._custom_id !== "destination-marker"
        );
      }
    } catch (error) {
      console.log(error);
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
    addFixedOriginMarker,
    addDestinationMarker,
    addFixedDestinationMarker,
    addOriginMarker,
    removeDestinationMarker,
    mapLoaded,
  };
});
