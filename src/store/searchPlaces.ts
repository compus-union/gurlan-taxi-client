import { defineStore } from "pinia";
import { ref } from "vue";
import { geocodingInstance } from "@/http/instances";
import { toastController } from "@ionic/vue";

export const useSearchPlaces = defineStore("search-places-store", () => {
  const places = ref([]);
  const { searchPlace } = geocodingInstance();
  const notFound = ref<boolean>(false);

  async function searchPlaces(q: string) {
    if (q.length === 0) {
      places.value = [];
      return;
    }

    if (q.length <= 2) {
      return;
    }

    try {
      const response = await searchPlace(q);

      if (response?.data.status !== 'not-found') {
        if (notFound.value) {
          notFound.value = false;
        }

        places.value = response?.data.data;

        return;
      }

      if (response?.data.status === 'not-found') {
        places.value = [];
        notFound.value = true;
      }
    } catch (error: any) {
      const toast = await toastController.create({
        message:
          error.message || error.response.data.msg || "Xatolik yuzaga keldi",
      });

      await toast.present();
    }
  }

  return { searchPlaces, places, notFound };
});
