import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authInstance } from "@/http/instances";
import { Preferences } from "@capacitor/preferences";
import { Network } from "@capacitor/network";
import { ResponseStatus } from "@/constants";
import { loadingController } from "@ionic/vue";
import { toast } from "vue3-toastify";
import { useRouter } from "vue-router";

interface ClientDetails {
  firstname: string;
  lastname: string;
  phone: string;
  password: string;
  email: string;
  confirmationCode: string;
  [propName: string]: any;
}

export const useAuth = defineStore("auth-store", () => {
  const authHttp = authInstance();
  const router = useRouter();

  const clientDetails = ref<ClientDetails>({
    firstname: "",
    lastname: "",
    phone: "998",
    password: "",
    email: "",
    confirmationCode: "",
  });

  const fullname = computed(() => {
    return `${clientDetails.value.firstname} ${clientDetails.value.lastname}`;
  });

  async function login<T>(): Promise<
    { status: ResponseStatus | "nextStep" } | undefined
  > {
    const networkStatus = await Network.getStatus();

    const loading = await loadingController.create({
      message: "Yuklanmoqda...",
    });

    try {
      await loading.present();
      if (!clientDetails.value.phone) {
        toast("Telefon raqam kiritilishi lozim");

        return {
          status: ResponseStatus.AUTH_WARNING,
        };
      }

      if (!clientDetails.value.password) {
        toast("Parol kiritilishi lozim");

        return {
          status: ResponseStatus.AUTH_WARNING,
        };
      }

      if (!networkStatus.connected) {
        toast(
          "Internet bilan aloqa borligini tekshirib, boshqatdan urinib ko'ring"
        );

        return {
          status: ResponseStatus.NETWORK_ERR,
        };
      }

      const response = await authHttp.auth({
        client: { ...clientDetails.value, fullname: fullname.value },
      });

      // Serverda xatolik yoki internet bilan aloqa bo'lmaganida
      if (!response || response.status >= 400) {
        await loading.dismiss();
        toast("Server bilan aloqa mavjud emas, boshqatdan urinib ko'ring");

        return;
      }

      if (response.data.status === ResponseStatus.AUTH_WARNING) {
        toast(response.data.msg);
        return;
      }

      // hammasi yaxshi, tizigma kiriladi
      if (
        response.data.status === ResponseStatus.CONFIRMATION_CODE_SENT &&
        response.data.clientStatus === "CONFIRMING"
      ) {
        await Preferences.set({ key: "confirmation", value: "false" });
        await Preferences.set({ key: "oneId", value: response.data.oneId });

        toast(response.data.msg, { autoClose: 10000 });

        return {
          status: ResponseStatus.CONFIRMATION_CODE_SENT,
        };
      }

      if (response.data.status === ResponseStatus.BANNED) {
        toast(response.data.msg);
        await Promise.allSettled([Preferences.clear()]);

        return {
          status: response.data.status,
        };
      }

      if (response.data.status === ResponseStatus.CLIENT_LOGIN_DONE) {
        toast(response.data.msg);
        await Promise.allSettled([
          Preferences.set({
            key: "clientOneId",
            value: response.data.client.oneId,
          }),
          Preferences.set({ key: "auth_token", value: response.data.token }),
          Preferences.set({ key: "confirmation", value: "true" }),
          Preferences.remove({ key: "oneId" }),
        ]);

        return {
          status: ResponseStatus.CLIENT_LOGIN_DONE,
        };
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        toast("Amal bekor qilindi.");
        return;
      }

      toast(
        error.response.data.msg ||
          error.message ||
          "Qandaydir xatolik yuzaga keldi, boshqatdan urinib ko'ring"
      );

      return {
        status: ResponseStatus.UNKNOWN_ERR,
      };
    } finally {
      await loading.dismiss();
    }
  }

  async function check(): Promise<
    | {
        status: ResponseStatus | undefined;
      }
    | undefined
  > {
    try {
      const networkStatus = await Network.getStatus();

      if (!networkStatus.connected) {
        toast(
          "Internet bilan aloqa mavjud emas, internetingizni tekshirib, dasturga boshqatdan kiring"
        );

        return { status: ResponseStatus.NETWORK_ERR };
      }
      const response = await authHttp.check();

      if (!response || response.status >= 400) {
        toast("Serverga ulanib bo'lmadi, dasturni boshqatdan ishga tushiring");

        return {
          status: ResponseStatus.NETWORK_ERR,
        };
      }

      if (
        response?.data.status === ResponseStatus.TOKEN_NOT_FOUND ||
        response.data.status === ResponseStatus.CLIENT_NOT_FOUND ||
        response.data.status === ResponseStatus.TOKEN_NOT_VALID ||
        response.data.status === ResponseStatus.BANNED
      ) {
        await Preferences.clear()
        await router.push("/auth/login")
        toast(response.data.msg);

        return {
          status: response.data.status,
        };
      }

      if (response.data.status === ResponseStatus.CLIENT_CHECK_DONE) {
        await Promise.allSettled([
          Preferences.set({ key: "auth_token", value: response?.data.token }),
          Preferences.set({
            key: "clientOneId",
            value: response?.data.client.oneId,
          }),
        ]);

        return {
          status: ResponseStatus.CLIENT_CHECK_DONE,
        };
      }
    } catch (error: any) {
      console.log(error);

      toast(
        error.response?.data.msg ||
          error.message ||
          "Qandaydir xato yuzaga keldi, dasturni boshqatdan ishga tushiring"
      );
      return { status: ResponseStatus.UNKNOWN_ERR };
    }
  }

  async function confirmAccount() {
    const networkStatus = await Network.getStatus();

    const loading = await loadingController.create({
      message: "Yuklanmoqda...",
    });

    try {
      await loading.present();

      if (!networkStatus.connected) {
        toast("Internetingizni tekshirib, boshqatdan urinib ko'ring");

        return {
          status: ResponseStatus.NETWORK_ERR,
        };
      }

      const { value: oneId } = await Preferences.get({ key: "oneId" });

      if (!oneId) {
        toast(
          "Sizda bu amalni bajarish uchun malumotlar yetarli emas, boshqatdan ro'yxatdan urining"
        );

        return {
          status: ResponseStatus.AUTH_WARNING,
        };
      }

      if (
        !clientDetails.value.confirmationCode ||
        clientDetails.value.confirmationCode.length < 6
      ) {
        toast("Belgilangan qatorni to'ldiring");
        return {
          status: ResponseStatus.AUTH_WARNING,
        };
      }

      const res = await authHttp.confirmation(
        clientDetails.value.confirmationCode,
        oneId as string
      );

      if (!res || res.status >= 400) {
        toast("Serverga ulanib bo'lmadi, dasturni boshqatdan ishga tushiring");

        return {
          status: ResponseStatus.NETWORK_ERR,
        };
      }

      if (res.data.status === ResponseStatus.CLIENT_NOT_FOUND) {
        toast(
          "Sizning akkauntingiz tizimda mavjud emas, boshqatdan ro'yxatdan o'ting"
        );
        await Preferences.clear();

        return {
          status: ResponseStatus.CLIENT_NOT_FOUND,
        };
      }

      if (res.data.status === ResponseStatus.AUTH_WARNING) {
        toast(res.data.msg);

        return { status: ResponseStatus.AUTH_WARNING };
      }

      if (res.data.status === ResponseStatus.CONFIRMATION_DONE) {
        const promises = [
          Preferences.set({ key: "confirmation", value: "true" }),
          Preferences.set({ key: "auth_token", value: res.data.token }),
          Preferences.set({ key: "clientOneId", value: res.data.client.oneId }),
          Preferences.remove({ key: "oneId" }),
        ];

        await Promise.allSettled(promises);

        toast(res.data.msg);

        return { status: res.data.status };
      }

      return;
    } catch (error: any) {
      toast(
        error.response.data.msg ||
          error.message ||
          "Qandaydir xato yuzaga keldi, dasturni boshqatdan ishga tushiring"
      );
      return { status: ResponseStatus.UNKNOWN_ERR };
    } finally {
      await loading.dismiss();
    }
  }

  async function sendConfirmationCodeAgain() {
    const loading = await loadingController.create({
      message: "Yuklanmoqda...",
    });
    try {
      await loading.present();
      const networkStatus = await Network.getStatus();

      if (!networkStatus.connected) {
        toast(
          "Internet bilan aloqa mavjud emas, internetingizni tekshirib, dasturga boshqatdan kiring"
        );

        return { status: ResponseStatus.NETWORK_ERR };
      }

      const { value: oneId } = await Preferences.get({ key: "oneId" });

      if (!oneId) {
        toast(
          "Kodni boshqatdan olish uchun sizdagi malumotlar yetarli emas, boshqatdan ro'yxatdan o'ting."
        );
        await Preferences.clear();
        await router.push({ path: "/auth/login" });
        return;
      }

      const response = await authHttp.sendConfirmationCodeAgain(
        oneId as string
      );

      if (!response || response.data.status >= 400) {
        toast("Serverdan javob yo'q, boshqatdan urinib ko'ring");

        return {
          status: ResponseStatus.NETWORK_ERR,
        };
      }

      if (
        response.data.status === ResponseStatus.CONFIRMATION_DONE ||
        response.data.status === ResponseStatus.AUTH_WARNING ||
        response.data.status === ResponseStatus.CONFIRMATION_CODE_SENT
      ) {
        toast(response.data.msg);

        return {
          status: response.data.status,
        };
      }
    } catch (error: any) {
      toast(
        error.response.data.msg ||
          error.message ||
          "Qandaydir xato yuzaga keldi, dasturni boshqatdan ishga tushiring"
      );
      return { status: ResponseStatus.UNKNOWN_ERR };
    } finally {
      await loading.dismiss();
    }
  }

  return {
    clientDetails,
    login,
    fullname,
    check,
    confirmAccount,
    sendConfirmationCodeAgain,
  };
});
