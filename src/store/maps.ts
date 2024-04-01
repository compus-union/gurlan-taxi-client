import { defineStore, storeToRefs } from "pinia";
import { useOriginCoords } from "./origin";
import { useDestination } from "./destination";
import { computed, ref, watch } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRoute } from "vue-router";
import RealLocationPointIcon from "@/assets/real-location-point.svg";
import "@maptiler/leaflet-maptilersdk";
import { useLoading } from "./loading";
import OriginFixedMarkerIcon from "@/assets/origin-fixed-marker.svg";
import DestinationFixedMarkerIcon from "@/assets/destination-fixed-marker.svg";
import { LayerGroup, Map } from "leaflet";
import { Address, useRoutes } from "./routes";

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
  const routesStore = useRoutes();
  const loadingStore = useLoading();
  const sharedMap = ref<L.Map>();
  const originStore = useOriginCoords();
  const markers = ref<CustomMarker[]>([]);
  const defaultZoom = ref(16);
  const minZoom = ref(13);
  const mapMoving = ref(false);
  const destinationStore = useDestination();
  const route = useRoute();
  const mapLoaded = ref(false);
  const markerVisible = ref(true);
  const isSearching = ref<true | false | null>(null);

  const { loading } = storeToRefs(loadingStore);
  const { isRouteInstalled } = storeToRefs(routesStore);

  const isMarkerAnimating = computed(() => {
    if (loading.value || mapMoving.value) {
      return true;
    }

    return false;
  });

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

        return;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function initialiseEvents() {
    try {
      // get origin marker
      sharedMap.value?.addEventListener("dragstart", async () => {
        if (isSearching.value) isSearching.value = false;
        if (route.path === "/ride/letsgo") return;

        mapMoving.value = true;
      });

      sharedMap.value?.addEventListener("zoomstart", async (e) => {
        if (isSearching.value) isSearching.value = false;
        if (route.path === "/ride/letsgo") return;

        mapMoving.value = true;

        return;
      });

      sharedMap.value?.addEventListener("zoomend", async (e) => {
        mapMoving.value = false;
        if (typeof isRouteInstalled.value === "boolean") return;
        if (route.path === "/ride/letsgo") return;
        if (isSearching.value) return;

        isSearching.value = false;
        const lat = sharedMap.value?.getCenter().lat as number;
        const lng = sharedMap.value?.getCenter().lng as number;

        if (route.path === "/ride/setOrigin") {
          await originStore.changeCoords({ lat, lng });

          return;
        }

        if (route.path === "/ride/setDestination") {
          await destinationStore.changeCoords({ lat, lng }, "void");

          return;
        }
      });

      sharedMap.value?.addEventListener(
        "dragend",
        async (e) => {
          setTimeout(async () => {
            mapMoving.value = false;
            if (typeof isRouteInstalled.value === "boolean") return;
            if (route.path === "/ride/letsgo") return;
            if (isSearching.value) return;

            isSearching.value = false;
            const lat = sharedMap.value?.getCenter().lat as number;
            const lng = sharedMap.value?.getCenter().lng as number;

            if (route.path === "/ride/setOrigin") {
              await originStore.changeCoords({ lat, lng });

              return;
            }

            if (route.path === "/ride/setDestination") {
              await destinationStore.changeCoords({ lat, lng }, "void");

              return;
            }
          });
        },
        800
      );
    } catch (error) {
      console.log(error);
    }
  }

  async function addFixedMarkers(origin: any, destination: any) {
    const originFixedIcon = L.icon({
      iconUrl: OriginFixedMarkerIcon,
      iconAnchor: [20, 67],
    });

    const originFixedMarker = L.marker([origin.lat, origin.lng], {
      icon: originFixedIcon,
    }).addTo(sharedMap.value as Map | LayerGroup<any>) as CustomMarker;

    const destinationFixedIcon = L.icon({
      iconUrl: DestinationFixedMarkerIcon,
      iconAnchor: [20, 67],
    });

    const destinationFixedMarker = L.marker(
      [destination.lat, destination.lng],
      { icon: destinationFixedIcon }
    ).addTo(sharedMap.value as Map | LayerGroup<any>) as CustomMarker;

    originFixedMarker._custom_id = "origin-marker-fixed";
    destinationFixedMarker._custom_id = "destination-marker-fixed";

    const existOriginMarker = await findMarker("origin-marker-fixed");
    const existDestinationMarker = await findMarker("destination-marker-fixed");

    if (existOriginMarker) {
      await removeMarker(originFixedMarker);
    }

    if (existDestinationMarker) {
      await removeMarker(destinationFixedMarker);
    }

    markers.value.push(originFixedMarker);
    markers.value.push(destinationFixedMarker);
    return;
  }

  return {
    loadMap,
    setMap,
    sharedMap,
    markers,
    defaultZoom,
    mapMoving,
    initialiseEvents,
    mapLoaded,
    findMarker,
    isMarkerAnimating,
    addFixedMarkers,
    markerVisible,
    removeMarker,
    isSearching,
  };
});
