import { defineStore } from "pinia";
import { ref } from "vue";
import { clientInstance } from "@/http/instances";
import { ResponseStatus } from "@/constants";
import { Preferences } from "@capacitor/preferences";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";

interface Client {
  id: string;
  oneId: string;
  createdAt: Date;
  fullname: string;
  phone: string;
  password: string;
  bonus: string;
  moneySpent: string;
  rides: any[];
  status: string;
  ban: object;
  lastLogin: Date;
  deleted: boolean;
  bannedId: string;
  Approval: object;
  confirmation: object;
  approvalId: string;
  confirmationId: string;
  [key: string]: any;
}

export const useClient = defineStore("client-store", () => {
  const clientHttp = clientInstance();
  const client = ref<Client>();
  const router = useRouter();

  async function setClient(payload: Client) {
    client.value = payload;
    return;
  }

  async function getClient() {
    try {
      const response = await clientHttp.getProfile();

      if (!response) {
        throw new Error(
          "Internet bilan aloqa mavjud emas, dasturni boshqatdan ishga tushiring"
        );
      }

      if (
        response.data.status === ResponseStatus.CLIENT_NOT_FOUND ||
        response.data.status === ResponseStatus.TOKEN_NOT_FOUND ||
        response.data.status === ResponseStatus.TOKEN_NOT_VALID ||
        response.data.status === ResponseStatus.BANNED
      ) {
        await Preferences.clear();
        await router.push("/auth/login");
        toast(response.data.msg);
      }

      await setClient(response.data.client);
      return {
        status: "ok",
      };
    } catch (error: any) {
      toast(
        error.message ||
          error.response.data.msg ||
          "Xatolik yuzaga keldi, dasturni boshqatdan ishga tushiring"
      );
    }
  }

  async function updatePersonalInfo() {
    try {
      const response = await clientHttp.updatePersonalInfo();

      if (!response) {
        throw new Error(
          "Internet bilan aloqa mavjud emas, dasturni boshqatdan ishga tushiring"
        );
      }

      if (
        response.data.status === ResponseStatus.CLIENT_NOT_FOUND ||
        response.data.status === ResponseStatus.TOKEN_NOT_FOUND ||
        response.data.status === ResponseStatus.TOKEN_NOT_VALID ||
        response.data.status === ResponseStatus.BANNED
      ) {
        await Preferences.clear();
        await router.push("/auth/login");
        toast(response.data.msg);
      }
      
      await Promise.allSettled([
        setClient(response.data.client),
        Preferences.set({ key: "auth_token", value: response.data.token }),
      ]);

      return {
        status: "ok",
      };
    } catch (error: any) {
      toast(
        error.message ||
          error.response.data.msg ||
          "Xatolik yuzaga keldi, dasturni boshqatdan ishga tushiring"
      );
    }
  }

  return { client, setClient, getClient };
});
