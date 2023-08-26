import config from "../config";
import { toastController } from "@ionic/vue";
import axios from "axios";
import { useLoading } from "@/store/loading";
import { Preferences } from "@capacitor/preferences";
import { ref } from "vue";

const loadingStore = useLoading();

export function authInstance() {
  let baseUrl = config.SERVER_URL + "/auth";

  async function auth(data: any) {
    try {
      const response = await axios.post(baseUrl + "/login", data);
      console.log(response);

      return response;
    } catch (error: any) {
      console.log(error);
      const toast = await toastController.create({
        message: error.message,
        duration: 2000,
      });

      await toast.present();
    }
  }

  async function register(data: any) {
    try {
      const response = await axios.post(baseUrl + "/register", data);

      return response;
    } catch (error: any) {
      console.log(error);
      const toast = await toastController.create({
        message: error.message,
        duration: 2000,
      });

      await toast.present();
    }
  }

  return { auth, register };
}

export function geocodingInstance() {
  const baseUrl = config.SERVER_URL + "/geocoding";
  let clientOneId = ref<string | null>();

  async function searchPlace(q: string) {
    try {
      if (!clientOneId.value) {
        const { value } = await Preferences.get({ key: "clientOneId" });
        clientOneId.value = value;
      }

      await loadingStore.setLoading(true);

      const response = await axios.get(
        baseUrl + `/search/${clientOneId.value}/${q}`
      );

      return response;
    } catch (error: any) {
      console.log(error);

      const toast = await toastController.create({
        message: error.message,
        duration: 2000,
      });

      await toast.present();
    } finally {
      await loadingStore.setLoading(false);
    }
  }

  async function reverseGeocoding(lat: number, lng: number) {
    try {
      if (!clientOneId.value) {
        const { value } = await Preferences.get({ key: "clientOneId" });
        clientOneId.value = value;
      }

      await loadingStore.setLoading(true);

      const response = await axios.get(baseUrl + "/reverse", {
        params: { lat, lng },
      });

      return response;
    } catch (error: any) {
      console.log(error);

      const toast = await toastController.create({
        message: error.message,
        duration: 2000,
      });

      await toast.present();
    } finally {
      await loadingStore.setLoading(false);
    }
  }

  return { searchPlace, reverseGeocoding };
}
