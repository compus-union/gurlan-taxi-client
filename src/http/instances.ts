import config from "../config";
import axios from "axios";
import { useLoading } from "@/store/loading";
import { Preferences } from "@capacitor/preferences";
import { ref } from "vue";
import { toast } from "vue3-toastify";
import { Address } from "@/store/routes";

export function authInstance() {
  let baseUrl = config.SERVER_URL + "/client";
  let defaultTimeout: undefined;
  let defaultTimeoutMessage = "Kutish vaqti tugadi, serverdan javob yo'q";

  async function auth(data: any) {
    try {
      const response = await axios.post(baseUrl + "/login", data, {
        timeout: defaultTimeout,
        timeoutErrorMessage: defaultTimeoutMessage,
      });

      return response;
    } catch (error: any) {
      console.log(error);
      toast(
        error.message ||
          error.response.data.msg ||
          "Qandaydir xatolik yuz berdi, boshqatdan urinib ko'ring"
      );
    }
  }

  async function check() {
    try {
      const { value: oneId } = await Preferences.get({ key: "clientOneId" });
      const { value: token } = await Preferences.get({ key: "auth_token" });

      const response = await axios.get(baseUrl + `/check/${oneId}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: defaultTimeout,
        timeoutErrorMessage: defaultTimeoutMessage,
      });

      return response;
    } catch (error: any) {
      console.log(error);
      toast(
        error.message ||
          error.response.data.msg ||
          "Qandaydir xatolik yuz berdi, boshqatdan urinib ko'ring"
      );
    }
  }

  async function confirmation(code: string, oneId: string) {
    try {
      const response = await axios.put(
        baseUrl + `/confirm/${oneId}`,
        { code },
        { timeout: defaultTimeout }
      );

      return response;
    } catch (error: any) {
      console.log(error);
      toast(
        error.message ||
          error.response.data.msg ||
          "Qandaydir xatolik yuz berdi, boshqatdan urinib ko'ring"
      );
    }
  }

  async function sendConfirmationCodeAgain(oneId: string) {
    try {
      const response = await axios.put(baseUrl + `/send-code-again/${oneId}`, {
        timeout: defaultTimeout,
      });

      return response;
    } catch (error: any) {
      console.log(error);
      toast(
        error.message ||
          error.response.data.msg ||
          "Qandaydir xatolik yuz berdi, boshqatdan urinib ko'ring"
      );
    }
  }

  return { auth, check, confirmation, sendConfirmationCodeAgain };
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

      toast(
        error.message ||
          error.response.data.msg ||
          "Qandaydir xatolik yuz berdi, boshqatdan urinib ko'ring"
      );
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

      const response = await axios.get(
        baseUrl + `/reverse/${clientOneId.value}/${lat}/${lng}`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
        }
      );

      return response;
    } catch (error: any) {
      console.log(error);

      toast(
        error.message ||
          error.response.data.msg ||
          "Qandaydir xatolik yuz berdi, boshqatdan urinib ko'ring"
      );
    } finally {
      await loadingStore.setLoading(false);
    }
  }

  return { searchPlace, reverseGeocoding };
}

export function routeInstance() {
  const loadingStore = useLoading();

  const baseUrl = config.SERVER_URL + "/routes";
  let clientOneId = ref<string | null>();
  let token = ref<string | null>();

  async function getGeometryOfRoute(destination: Address, origin: Address) {
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

      const response = await axios.put(
        baseUrl + `/calculate/${clientOneId.value}`,
        { destination, origin },
        {
          headers: { Authorization: `Bearer ${token.value}` },
        }
      );

      console.log(response);

      return response;
    } catch (error: any) {
      console.log(error);

      toast(
        error.message ||
          error.response.data.msg ||
          "Qandaydir xatolik yuz berdi, boshqatdan urinib ko'ring"
      );
    } finally {
      await loadingStore.setLoading(false);
    }
  }

  return { getGeometryOfRoute };
}

export function clientInstance() {
  const loadingStore = useLoading();

  const baseUrl = config.SERVER_URL + "/client";
  let clientOneId = ref<string | null>();
  let token = ref<string | null>();

  async function getProfile(destination: Address, origin: Address) {
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
        baseUrl + `/get-account/${clientOneId.value}`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
        }
      );

      console.log(response);

      return response;
    } catch (error: any) {
      console.log(error);

      toast(
        error.message ||
          error.response.data.msg ||
          "Qandaydir xatolik yuz berdi, boshqatdan urinib ko'ring"
      );
    } finally {
      await loadingStore.setLoading(false);
    }
  }

  return { getProfile };
}
