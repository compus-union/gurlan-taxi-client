import { defineStore, storeToRefs } from "pinia";
import { useOriginCoords } from "./origin";
import { useDestination } from "./destination";
import { ref } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LayerGroup, Map } from "leaflet";
import { useRoute } from "vue-router";
import OriginMarkerIcon from "@/assets/origin-marker-icon.svg";
import DestinationMarkerIcon from "@/assets/destination-marker-icon.svg";
import RealLocationPointIcon from "@/assets/real-location-point.svg";
import "@maptiler/leaflet-maptilersdk";
import "leaflet.smooth_marker_bouncing";

export interface CustomMarker extends L.Marker {
  latLng?: L.LatLng;
  _custom_id?: string;
}

type MarkerID =
  | "origin-marker"
  | "destination-marker"
  | "origin-marker-fixed"
  | "destination-marker-fixed"
  | "real-location-point";

export const useMaps = defineStore("maps-store", () => {
  const sharedMap = ref<L.Map>();
  const originStore = useOriginCoords();
  const markers = ref<CustomMarker[]>([]);
  const defaultZoom = ref(16);
  const mapMoving = ref(false);
  const destinationStore = useDestination();
  const route = useRoute();
  const mapLoaded = ref(false);

  const { coords: originCoords, realLat, realLng } = storeToRefs(originStore);
  const { coords: destinationCoords } = storeToRefs(destinationStore);

  async function setMap(payload: L.Map) {
    sharedMap.value = payload;
    return;
  }

  async function findMarker(type: MarkerID) {
    let marker = markers.value.find(
      (m) => m._custom_id === type
    ) as CustomMarker;

    return marker;
  }

  async function removeMarker(marker: CustomMarker) {
    sharedMap.value?.removeLayer(marker);
    markers.value = markers.value.filter(
      (m) => m._custom_id !== marker._custom_id
    );
    return;
  }

  async function loadMap(id: string) {
    try {
      // get origin coords, where user is located
      await originStore.getCoords();
      await originStore.watchCoords();

      // initalise the map
      if (originCoords.value) {
        sharedMap.value = L.map(id, {
          zoomControl: false,
          maxZoom: 20,
        }).setView(
          [originCoords.value.lat, originCoords.value.lng],
          defaultZoom.value
        );

        // add layers to the map
        L.tileLayer(
          "https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png",
          {
            maxZoom: 20,
          }
        )
          .addTo(sharedMap.value)
          .addEventListener("load", () => {
            if (mapLoaded.value) return;
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
          const realLocationPointIcon = L.icon({
            iconUrl: RealLocationPointIcon,
            iconSize: [16, 16],
          });

          const realLocationPoint = L.marker([realLat.value, realLng.value], {
            icon: realLocationPointIcon,
          }).addTo(sharedMap.value) as CustomMarker;

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

      sharedMap.value?.addEventListener("drag", async (e) => {
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

        if (route.path === "/ride/setOrigin" && originMarker) {
          originMarker
            .setLatLng([lat, lng])
            .addTo(sharedMap.value as Map | LayerGroup<any>);
          return;
        }

        if (route.path === "/ride/setDestination" && destinationMarker) {
          destinationMarker
            .setLatLng([lat, lng])
            .addTo(sharedMap.value as Map | LayerGroup<any>);
          return;
        }
      });
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

        if (route.path === "/ride/setOrigin" && originMarker) {
          originMarker
            .setLatLng([lat, lng])
            .addTo(sharedMap.value as Map | LayerGroup<any>);
          return;
        }

        if (route.path === "/ride/setDestination" && destinationMarker) {
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

        if (route.path === "/ride/setOrigin" && originMarker) {
          originMarker
            .setLatLng([lat, lng])
            .addTo(sharedMap.value as Map | LayerGroup<any>);
          return;
        }

        if (route.path === "/ride/setDestination" && destinationMarker) {
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

        if (route.path === "/ride/setOrigin" && originMarker) {
          await originStore.changeCoords({ lat, lng });

          originMarker
            .setLatLng([lat, lng])
            .addTo(sharedMap.value as Map | LayerGroup<any>)
          return;
        }

        if (route.path === "/ride/setDestination" && destinationMarker) {
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

        if (route.path === "/ride/setOrigin" && originMarker) {
          await originStore.changeCoords({ lat, lng });

          originMarker
            .setLatLng([lat, lng])
            .addTo(sharedMap.value as Map | LayerGroup<any>);
          return;
        }

        if (route.path === "/ride/setDestination" && destinationMarker) {
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

        if (route.path === "/ride/setOrigin" && originMarker) {
          await originStore.changeCoords({ lat, lng });

          originMarker
            .setLatLng([lat, lng])
            .addTo(sharedMap.value as Map | LayerGroup<any>);
          return;
        }

        if (route.path === "/ride/setDestination" && destinationMarker) {
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

  // remove if origin-marker-fixed marker exists, then add origin-marker
  async function addOriginMarker() {
    try {
      // get fixed marker of origin marker
      const originMarkerFixed = await findMarker("origin-marker-fixed");
      // if it exists, remove it
      if (originMarkerFixed) {
        await removeMarker(originMarkerFixed);
      }

      // check if origin marker already exists
      let originMarker = await findMarker("origin-marker");

      // if doesn't exists, add it
      if (!originMarker) {
        const originMarkerIcon = L.icon({
          iconUrl: OriginMarkerIcon,
          iconSize: [44, 60],
          iconAnchor: [22, 60],
        });
        originMarker = L.marker(
          [originCoords.value.lat, originCoords.value.lng],
          {
            icon: originMarkerIcon,
            title: "Siz shu yerda"
          }
        );
        originMarker._custom_id = "origin-marker";
        originMarker.addTo(sharedMap.value as Map | LayerGroup<any>);
        markers.value.push(originMarker as CustomMarker);
        return;
      }
    } catch (error) {
      console.log(error);
    }
  }

  // remove if destination-marker-fixed marker exists, then add destination-marker
  async function addDestinationMarker() {
    try {
      // get fixed marker of destination marker
      const destinationMarkerFixed = await findMarker(
        "destination-marker-fixed"
      );
      // if it exists, remove it
      if (destinationMarkerFixed) {
        await removeMarker(destinationMarkerFixed);
      }

      // check if destination marker already exists
      let destinationMarker = await findMarker("destination-marker");

      // if doesn't exists, add it
      if (!destinationMarker) {
        const destinationIcon = L.icon({
          iconUrl: DestinationMarkerIcon,
          iconSize: [44, 60],
          iconAnchor: [22, 60],
        });

        destinationMarker = L.marker(
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
        );

        destinationMarker._custom_id = "destination-marker";
        destinationMarker.addTo(sharedMap.value as Map | LayerGroup<any>);
        markers.value.push(destinationMarker as CustomMarker);

        return;
      }
    } catch (error) {
      console.log(error);
    }
  }

  // remove if origin-marker exists, then add origin-marker-fixed
  async function addFixedOriginMarker() {
    try {
      const originMarker = await findMarker("origin-marker");

      if (originMarker) {
        await removeMarker(originMarker);
      }

      const originMarkerIcon = L.icon({
        iconUrl: OriginMarkerIcon,
        iconSize: [44, 60],
        iconAnchor: [22, 60],
      });

      const fixedOriginMarker = L.marker(
        [originCoords.value.lat, originCoords.value.lng],
        {
          icon: originMarkerIcon,
        }
      ) as CustomMarker;

      fixedOriginMarker._custom_id = "origin-marker-fixed";
      fixedOriginMarker.addTo(sharedMap.value as Map);
      markers.value.push(fixedOriginMarker);
      return;
    } catch (error) {
      console.log(error);
    }
  }

  // remove if destination-marker exists, then add destination-marker-fixed
  async function addFixedDestinationMarker() {
    try {
      const destinationMarker = await findMarker("destination-marker");

      if (destinationMarker) {
        await removeMarker(destinationMarker);
      }

      const destinationIcon = L.icon({
        iconUrl: DestinationMarkerIcon,
        iconSize: [44, 60],
        iconAnchor: [22, 60],
      });

      const fixedDestinationMarker = L.marker(
        [
          destinationCoords.value.lat
            ? destinationCoords.value.lat
            : originCoords.value.lat,
          destinationCoords.value.lng
            ? destinationCoords.value.lng
            : originCoords.value.lng,
        ],
        { icon: destinationIcon }
      ) as CustomMarker;

      fixedDestinationMarker._custom_id = "destination-marker-fixed";
      fixedDestinationMarker.addTo(sharedMap.value as Map);
      markers.value.push(fixedDestinationMarker);
      return;
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
    mapLoaded,
    findMarker
  };
});
