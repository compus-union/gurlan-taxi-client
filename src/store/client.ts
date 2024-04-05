import { defineStore } from "pinia";
import { computed, ref } from "vue";
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

  const fullnameSplitted = computed(() => {
    const splittedFirstname = client.value?.fullname.split(" ")[0];
    const splittedLastname = client.value?.fullname.split(" ")[1];

    return { firstname: splittedFirstname, lastname: splittedLastname };
  });

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

  async function updatePersonalInfo(fullname: string) {
    try {
      const response = await clientHttp.updatePersonalInfo({ fullname });

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
        Preferences.set({ key: "auth_token", value: response.data.token }),
      ]);

      toast(response.data.msg);

      return {
        status: "ok",
        client: response.data.client,
      };
    } catch (error: any) {
      toast(
        error.message ||
          error.response.data.msg ||
          "Xatolik yuzaga keldi, dasturni boshqatdan ishga tushiring"
      );
    }
  }

  return { client, setClient, getClient, updatePersonalInfo, fullnameSplitted };
});
