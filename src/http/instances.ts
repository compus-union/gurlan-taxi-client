import config from "../config";
import axios from "axios";
import { useLoading } from "@/store/loading";
import { Preferences } from "@capacitor/preferences";
import { ref } from "vue";

export function authInstance() {
  const loadingStore = useLoading();
  let baseUrl = config.SERVER_URL + "/client";

  async function auth(data: any) {
    try {
      const response = await axios.post(baseUrl + "/login", data);

      return response;
    } catch (error: any) {
      console.log(error);
      // show error with toast
    }
  }

  async function register(data: any) {
    try {
      const response = await axios.post(baseUrl + "/register", data);

      return response;
    } catch (error: any) {
      console.log(error);
      // show error with toast
    }
  }

  async function check() {
    try {
      const { value: oneId } = await Preferences.get({ key: "clientOneId" });
      const { value: token } = await Preferences.get({ key: "auth_token" });

      const response = await axios.get(baseUrl + `/check/${oneId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response;
    } catch (error: any) {
      console.log(error);
      // show error with toast
    }
  }

  return { auth, register, check };
}

export function geocodingInstance() {
  const loadingStore = useLoading();

  const baseUrl = config.SERVER_URL + "/geocoding";
  let clientOneId = ref<string | null>();
  let token = ref<string | null>();

  async function searchPlace(q: string) {
    try {
      if (!clientOneId.value) {
        const { value } = await Preferences.get({ key: "clientOneId" });
        clientOneId.value = value;
      }

      if (!token.value) {
        const { value } = await Preferences.get({ key: "auth_token" });
        token.value = value;
      }

      await loadingStore.setLoading(true);

      const response = await axios.get(
        baseUrl + `/search/${clientOneId.value}/${q}`,
        { headers: { Authorization: `Bearer ${token.value}` } }
      );

      return response;
    } catch (error: any) {
      console.log(error);

      // show error with toast
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

      if (!token.value) {
        const { value } = await Preferences.get({ key: "auth_token" });
        token.value = value;
      }

      await loadingStore.setLoading(true);

      const response = await axios.get(baseUrl + "/reverse", {
        params: { lat, lng },
        headers: { Authorization: `Bearer ${token.value}` },
      });

      return response;
    } catch (error: any) {
      console.log(error);

      // show error with toast
    } finally {
      await loadingStore.setLoading(false);
    }
  }

  return { searchPlace, reverseGeocoding };
}
