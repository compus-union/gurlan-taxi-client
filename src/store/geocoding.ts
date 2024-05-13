import { defineStore } from "pinia";
import { ref } from "vue";
import { geocodingInstance } from "@/http/instances";
import { useLoading } from "./loading";
import { toast } from "vue-sonner";

export interface Address {
  lat?: number;
  lng?: number;
  name?: string;
  displayName?: string;
  placeId?: string;
  road?: string;
  houseNumber?: string;
}

export const useGeocoding = defineStore("geocoding-store", () => {
  const id = ref("geocoding-store");
  const originAddress = ref<Address>();
  const destinationAddress = ref<Address>();
  const { reverseGeocoding } = geocodingInstance();
  const notFound = ref(false);
  const errorMessage = ref("");
  const loadingStore = useLoading();

  async function geocoding(
    lat: number,
    lng: number,
    type: "origin" | "destination"
  ) {
    console.log(type);
    
    try {
      if (!lat && !lng) return;
      await loadingStore.setLoading(true);
      const response = await reverseGeocoding(lat, lng);

      if (response?.data.status !== "ok") {
        await loadingStore.setLoading(false);
        if (type === "origin") originAddress.value = {};
        if (type === "destination") destinationAddress.value = {};

        notFound.value = true;
        errorMessage.value = "Manzil topilmadi";
      }
      if (response?.data.status === "ok") {
        await loadingStore.setLoading(false);

        if (notFound.value) notFound.value = false;

        if (type === "origin") originAddress.value = response.data.data;
        if (type === "destination")
          destinationAddress.value = response.data.data;
      }

      return;
    } catch (error: any) {
      await loadingStore.setLoading(false);
      errorMessage.value = error.message;
      toast.error(
        error.message ||
          error.response.data.msg ||
          "Qandaydir xatolik yuzaga keldi",
        { duration: 4000 }
      );
    }
  }
  return {
    geocoding,
    originAddress,
    destinationAddress,
    notFound,
    errorMessage,
  };
});
