import { defineStore, storeToRefs } from "pinia";
import { ref, toRefs } from "vue";
import { routeInstance } from "@/http/instances";
import { useMaps } from "./maps";
import L, { Map } from "leaflet";
import { toastController } from "@ionic/vue";
import { useDestination } from "./destination";

export interface Address {
  lat: number;
  lng: number;
  name: string;
}

export interface RouteGeoJSON extends L.GeoJSON {
  _custom_id: string;
}

export const useRoutes = defineStore("routes-store", () => {
  const destinationStore = useDestination();
  const mapsStore = useMaps();
  const routeHttp = routeInstance();
  const destination = ref<Address>();
  const origin = ref<Address>();
  const geoJSONs = ref<L.LayerGroup<any>>();
  const price = ref();
  const distance = ref<{ kmFixed: string; kmFull: string }>();
  const duration = ref<{
    full: string;
    hours: string;
    minutes: string;
    seconds: string;
  }>();
  const isRouteInstalled = ref<true | false | null>(null);

  const { sharedMap, defaultZoom, markerVisible } = storeToRefs(mapsStore);
  const { coords: destinationCoords } = storeToRefs(destinationStore);

  async function getGeometryOfRoute(d: Address, o: Address) {
    isRouteInstalled.value = false;
    try {
      destination.value = d;
      origin.value = o;

      const result = await routeHttp.getGeometryOfRoute(d, o);

      if (result?.data.status !== "ok") {
        console.log(result);
        throw new Error("Xatolik yuzaga keldi, boshqatdan urinib ko'ring");
      }

      price.value = result.data.price;
      duration.value = result.data.duration;
      distance.value = result.data.distance;

      const routeLayer = L.geoJSON(result.data.routes.geometry) as RouteGeoJSON;

      routeLayer._custom_id = "origin-to-destination";

      const layerGroup = L.layerGroup([routeLayer]);
      layerGroup.addTo(mapsStore.sharedMap as Map);
      mapsStore.sharedMap?.fitBounds(routeLayer.getBounds());
      geoJSONs.value = layerGroup;
      isRouteInstalled.value = true;

      return {
        status: "ok",
      };
    } catch (error: any) {
      console.log(error);

      if (error.response) {
        const toast = await toastController.create({
          message: error.response.data,
          duration: 4000,
        });
        await toast.present();
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log("Response error:", error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Request error:", error.request);
        const toast = await toastController.create({
          message: error.request,
          duration: 4000,
        });
        await toast.present();
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error:", error.message);
        const toast = await toastController.create({
          message: error.message,
          duration: 4000,
        });
        await toast.present();
      }
    }
  }

  async function removeTheGeometryOfRoute() {
    try {
      console.log(mapsStore.sharedMap);
      console.log(geoJSONs.value);

      if (!geoJSONs.value) return;

      markerVisible.value = true;
      price.value = {};
      distance.value = {} as { kmFixed: string; kmFull: string };
      duration.value = {} as {
        full: string;
        hours: string;
        minutes: string;
        seconds: string;
      };

      mapsStore.sharedMap?.removeLayer(geoJSONs.value);
      mapsStore.sharedMap?.setView(
        [destinationCoords.value.lat, destinationCoords.value.lng],
        defaultZoom.value
      );
      geoJSONs.value = {} as L.LayerGroup;

      const originMarkerFixed = await mapsStore.findMarker(
        "origin-marker-fixed"
      );
      const destinationMarkerFixed = await mapsStore.findMarker(
        "destination-marker-fixed"
      );

      if (originMarkerFixed) await mapsStore.removeMarker(originMarkerFixed);
      if (destinationMarkerFixed)
        await mapsStore.removeMarker(destinationMarkerFixed);

      return;
    } catch (error: any) {
      const toast = await toastController.create({
        message: "Qandaydir xatolik yuzaga keldi",
        duration: 4000,
      });
      await toast.present();
    }
  }

  return {
    getGeometryOfRoute,
    price,
    distance,
    duration,
    removeTheGeometryOfRoute,
    geoJSONs,
    isRouteInstalled,
  };
});
