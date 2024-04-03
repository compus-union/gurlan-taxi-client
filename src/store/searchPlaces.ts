import { defineStore } from "pinia";
import { ref } from "vue";
import { geocodingInstance } from "@/http/instances";
import { toast } from "vue3-toastify";

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

      if (response?.data.status !== "not-found") {
        if (notFound.value) {
          notFound.value = false;
        }

        places.value = response?.data.data;

        return;
      }

      if (response?.data.status === "not-found") {
        places.value = [];
        notFound.value = true;
      }
    } catch (error: any) {
      toast(error.message || error.response.data.msg || "Xatolik yuzaga keldi");
    }
  }

  return { searchPlaces, places, notFound };
});
