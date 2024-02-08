import { defineStore } from "pinia";
import { ref } from "vue";
import { geocodingInstance } from "@/http/instances";
import { toastController } from "@ionic/vue";

export interface Address {
  lat: number;
  lng: number;
  name: string;
  displayName: string;
  placeId: string;
  road: string;
  houseNumber?: string;
}

export const useGeocoding = defineStore("geocoding-store", () => {
  const id = ref("geocoding-store");
  const originAddress = ref<Address | {}>();
  const destinationAddress = ref<Address | {}>();
  const { reverseGeocoding } = geocodingInstance();
  const notFound = ref(false);
  const errorMessage = ref("");

  async function geocoding(
    lat: number,
    lng: number,
    type: "origin" | "destination"
  ) {
    try {
      const response = await reverseGeocoding(lat, lng);

      if (response?.data.status !== "ok") {
        if (type === "origin") originAddress.value = {};
        if (type === "destination") destinationAddress.value = {};

        notFound.value = true;
      }

      if (response?.data.status === "ok") {
        if (notFound.value) notFound.value = false;

        if (type === "origin") originAddress.value = response.data.data;
        if (type === "destination")
          destinationAddress.value = response.data.data;
      }

      return;
    } catch (error: any) {
      errorMessage.value = error.message;
      const toast = await toastController.create({
        message:
          error.message ||
          error.response.data.msg ||
          "Qandaydir xatolik yuzaga keldi",
        buttons: [
          {
            text: "OK",
            handler: async () => {
              await toast.dismiss();
            },
          },
        ],
        duration: 4000,
      });

      await toast.present();
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
