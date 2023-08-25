import config from "../config";
import { toastController } from "@ionic/vue";
import axios from "axios";
import { useLoading } from "@/store/loading";

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
  let baseUrl = `https://nominatim.openstreetmap.org`;

  async function searchPlace(q: string) {
    try {
      await loadingStore.setLoading(true);

      const response = await axios.get(baseUrl + "/search", {
        params: { q: `${q} Gurlan` },
        withCredentials: true
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

  async function reverseGeocoding(lat: number, lng: number) {
    try {
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
