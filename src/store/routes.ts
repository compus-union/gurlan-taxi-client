import { defineStore } from "pinia";
import { ref } from "vue";
import { routeInstance } from "@/http/instances";
import { useMaps } from "./maps";
import { storeToRefs } from "pinia";
import L, { Map } from "leaflet";
import { toastController } from "@ionic/vue";

export interface Address {
  lat: number;
  lng: number;
  name: string;
}

export interface RouteGeoJSON extends L.GeoJSON {
  _custom_id: string;
}

export const useRoutes = defineStore("routes-store", () => {
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

  const { sharedMap, defaultZoom } = storeToRefs(mapsStore);

  async function getGeometryOfRoute(d: Address, o: Address) {
    try {
      await mapsStore.addFixedDestinationMarker()
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
      layerGroup.addTo(sharedMap.value as Map);
      sharedMap.value?.fitBounds(routeLayer.getBounds());
      geoJSONs.value = layerGroup;

      return {
        status: "ok",
      };
    } catch (error: any) {
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
      if (!geoJSONs.value) return;
      // @ts-ignore
      const routeLayer = geoJSONs.value._layers.find((layer) => {
        return layer._custom_id === "origin-to-destination";
      });

      console.log(routeLayer);

      if (routeLayer) {
        // @ts-ignore
        geoJSONs.value = geoJSONs.value._layers.filter(
          // @ts-ignore
          (layer) => layer._custom_id !== "origin-to-destination"
        );
        sharedMap.value?.eachLayer((layer) => {
          console.log(layer);
        });
        await mapsStore.addDestinationMarker();
      }

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
  };
});
