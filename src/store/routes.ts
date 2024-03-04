import { defineStore } from "pinia";
import { ref } from "vue";
import { routeInstance } from "@/http/instances";

export interface Address {
  lat: number;
  lng: number;
  name: string;
}

export const useRoutes = defineStore("routes-store", () => {
  const routeHttp = routeInstance();
  const destination = ref<Address>();
  const origin = ref<Address>();
  const geometry = ref();
  const price = ref<{
    price: number;
    formatted: string;
    formatter: Function;
  }>();
  const distance = ref<{ kmFixed: string; kmFull: string }>();
  const duration = ref<{
    full: string;
    hours: string;
    minutes: string;
    seconds: string;
  }>();

  async function getGeometryOfRoute(d: Address, o: Address) {
    try {
      destination.value = d;
      origin.value = o;
      const result = await routeHttp.getGeometryOfRoute(d, o);

      if (result?.data.status !== "ok") {
        console.log(result);
        throw new Error("Xatolik yuzaga keldi, boshqatdan urinib ko'ring");
      }

      geometry.value = result.data.routes.geometry;
      price.value = result.data.price;
      duration.value = result.data.duration;
      distance.value = result.data.distance;

      return;
    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log("Response error:", error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Request error:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error:", error.message);
      }
    }
  }
});
