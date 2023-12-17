import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authInstance } from "@/http/instances";
import { Preferences } from "@capacitor/preferences";
import { Network } from "@capacitor/network";
import { ResponseStatus } from "@/constants";
import { loadingController } from "@ionic/vue";
import { toast } from "vue3-toastify";
import { GenericAbortSignal } from "axios";

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

  const clientDetails = ref<ClientDetails>({
    firstname: "",
    lastname: "",
    phone: "+998",
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
        alert("aloqa yoq");
        toast("Server bilan aloqa mavjud emas, boshqatdan urinib ko'ring");

        return;
      }

      // hammasi yaxshi, register qilsa bo'ladi
      if (
        response.data.status === ResponseStatus.CLIENT_READY_TO_REGISTER &&
        !response.data.registered
      ) {
        return {
          status: "nextStep",
        };
      }

      if (response.data.status === ResponseStatus.AUTH_WARNING) {
        toast(response.data.msg);
        return;
      }

      if (response.data.status === ResponseStatus.BANNED) {
        toast(response.data.msg);
        await Promise.allSettled([Preferences.clear()]);

        return {
          status: ResponseStatus.BANNED,
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

  async function register() {
    const networkStatus = await Network.getStatus();

    const loading = await loadingController.create({
      message: "Yuklanmoqda...",
    });

    try {
      await loading.present();

      if (!clientDetails.value.firstname) {
        toast("Ismingizni kiriting");

        return {
          status: ResponseStatus.AUTH_WARNING,
        };
      }

      if (!clientDetails.value.lastname) {
        toast("Familiyangizni kiriting");

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

      const response = await authHttp.register({
        client: { ...clientDetails.value, fullname: fullname.value },
      });

      //  Serverda xatolik yoki internet bilan aloqa bo'lmaganida
      if (!response || response.status >= 400) {
        toast("Server bilan aloqa mavjud emas, boshqatdan urinib ko'ring");

        throw new Error(
          "Serverda xatolik, internet bilan aloqangizni tekshiring yoki boshqatdan urinib ko'ring."
        );
      }

      //  Hammasi yaxshi
      if (response.data.status === ResponseStatus.CONFIRMATION_CODE_SENT) {
        const promises = [
          Preferences.set({
            key: "confirmation",
            value: "false",
          }),
        ];

        await Promise.allSettled(promises);

        toast(response.data.msg);

        return {
          status: ResponseStatus.CONFIRMATION_CODE_SENT,
          login: true,
        };
      }

      if (response.data.status === ResponseStatus.BANNED) {
        await Preferences.clear();
        toast(response.data.msg);

        return {
          status: ResponseStatus.BANNED,
        };
      }

      return;
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
        toast(response.data.msg);

        await Promise.allSettled([Preferences.clear()]);

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
      toast(
        error.response.data.msg ||
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
        await Preferences.set({ key: "confirmation", value: "true" });
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
      await loading.dismiss()
    }
  }

  return {
    clientDetails,
    login,
    fullname,
    register,
    check,
  };
});
