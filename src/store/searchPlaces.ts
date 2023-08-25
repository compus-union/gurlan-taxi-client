import { defineStore } from "pinia";
import { ref } from "vue";
import { geocodingInstance } from "@/http/instances";

export const useSearchPlaces = defineStore("search-places-store", () => {
  const places = ref<object[]>();
  const { searchPlace } = geocodingInstance();

  async function searchPlaces(q: string) {
    try {
      const response = await searchPlace(q);

      console.log(response?.data);
    } catch (error) {}
  }

  return { searchPlaces };
});
