import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authInstance } from "@/http/instances";
import { toastController, loadingController } from "@ionic/vue";
import { Preferences } from "@capacitor/preferences";
import { Network } from "@capacitor/network";
import { ResponseStatus } from "@/constants";

interface ClientDetails {
  firstname: string;
  lastname: string;
  phone: string;
  password: string;
  [propName: string]: any;
}

export const useAuth = defineStore("auth-store", () => {
  const authHttp = authInstance();

  const clientDetails = ref<ClientDetails>({
    firstname: "",
    lastname: "",
    phone: "+998",
    password: "",
  });

  const fullname = computed(() => {
    return `${clientDetails.value.firstname} ${clientDetails.value.lastname}`;
  });

  async function auth(): Promise<
    { status: ResponseStatus | "nextStep" } | undefined
  > {
    const networkStatus = await Network.getStatus();

    const loading = await loadingController.create({
      message: "Yuklanmoqda...",
    });

    const toastWarning = await toastController.create({
      message: "Iltimos, hamma qatorlarni to'ldiring.",
      duration: 4000,
      keyboardClose: true,
    });

    await loading.present();

    try {
      if (!clientDetails.value.phone) {
        await loading.dismiss();
        await toastWarning.present();
        return {
          status: ResponseStatus.AUTH_WARNING,
        };
      }

      if (!clientDetails.value.password) {
        await loading.dismiss();
        await toastWarning.present();
        return {
          status: ResponseStatus.AUTH_WARNING,
        };
      }

      if (!networkStatus.connected) {
        const noInternetToast = await toastController.create({
          message: "Server bilan aloqa mavjud emas",
          duration: 4000,
        });

        await noInternetToast.present();
        return {
          status: ResponseStatus.NETWORK_ERR,
        };
      }

      const response = await authHttp.auth({
        client: { ...clientDetails.value, fullname: fullname.value },
      });

      alert(JSON.stringify(response));

      // Serverda xatolik yoki internet bilan aloqa bo'lmaganida
      if (!response || response.status >= 400) {
        await loading.dismiss();
        const toast = await toastController.create({
          message:
            "Serverda xatolik, internet bilan aloqangizni tekshiring yoki boshqatdan urinib ko'ring.",
          duration: 4000,
          buttons: [
            {
              text: "OK",
              async handler() {
                await toast.dismiss();
              },
            },
          ],
        });

        await toast.present();
        return;
      }

      // hammasi yaxshi
      if (
        response.data.status === ResponseStatus.CLIENT_READY_TO_REGISTER &&
        !response.data.registered
      ) {
        await loading.dismiss();

        return {
          status: "nextStep",
        };
      }

      if (response.data.status === ResponseStatus.AUTH_WARNING) {
        await loading.dismiss();

        const newToast = await toastController.create({
          message: response.data.msg,
          duration: 4000,
          buttons: [
            {
              text: "OK",
              async handler() {
                await newToast.dismiss();
              },
            },
          ],
        });

        await newToast.present();

        return;
      }

      if (response.data.status === ResponseStatus.BANNED) {
        await loading.dismiss();

        const toast = await toastController.create({
          message: response.data.msg,
          duration: 4000,
          keyboardClose: true,
        });

        await Promise.allSettled([
          toast.present(),
          Preferences.remove({ key: "clientOneId" }),
          Preferences.remove({ key: "auth_token" }),
        ]);

        return {
          status: ResponseStatus.BANNED,
        };
      }

      if (response.data.status === ResponseStatus.CLIENT_LOGIN_DONE) {
        await loading.dismiss();

        const toast = await toastController.create({
          message: response.data.msg,
          duration: 4000,
          keyboardClose: true,
        });

        await Promise.allSettled([
          toast.present(),
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
      const toastError = await toastController.create({
        message:
          error.message || "Serverda xatolik, boshqatdan urinib ko'ring.",
        duration: 4000,
        keyboardClose: true,
      });

      await toastError.present();

      return {
        status: ResponseStatus.UNKNOWN_ERR,
      };
    }
  }

  async function register(): Promise<
    | {
        status: ResponseStatus;
        login?: boolean;
      }
    | undefined
  > {
    const networkStatus = await Network.getStatus();

    const loading = await loadingController.create({
      message: "Yuklanmoqda...",
    });

    const toastWarning = await loadingController.create({
      message: "Iltimos, hamma qatorlarni to'ldiring.",
      duration: 4000,
      keyboardClose: true,
    });

    try {
      await loading.present();

      if (!clientDetails.value.firstname) {
        await loading.dismiss();
        await toastWarning.present();
        return {
          status: ResponseStatus.AUTH_WARNING,
        };
      }

      if (!clientDetails.value.lastname) {
        await loading.dismiss();
        await toastWarning.present();
        return {
          status: ResponseStatus.AUTH_WARNING,
        };
      }

      if (!networkStatus.connected) {
        await loading.dismiss();

        const noInternetToast = await toastController.create({
          message: "Server bilan aloqa mavjud emas",
          duration: 4000,
        });

        await noInternetToast.present();
        return {
          status: ResponseStatus.NETWORK_ERR,
        };
      }

      const response = await authHttp.register({
        client: { ...clientDetails.value, fullname: fullname.value },
      });

      //  Serverda xatolik yoki internet bilan aloqa bo'lmaganida
      if (!response || response.status >= 400) {
        await loading.dismiss();

        throw new Error(
          "Serverda xatolik, internet bilan aloqangizni tekshiring yoki boshqatdan urinib ko'ring."
        );
      }

      //  Hammasi yaxshi
      if (response.data.status === ResponseStatus.CLIENT_REGISTER_DONE) {
        const promises = [
          loading.dismiss(),

          Preferences.set({
            key: "auth_token",
            value: response.data.token,
          }),

          Preferences.set({
            key: "clientOneId",
            value: response.data.client.oneId,
          }),
        ];

        await Promise.allSettled(promises);

        const toast = await toastController.create({
          message: response.data.msg,
          duration: 4000,
        });

        await toast.present();

        return {
          status: ResponseStatus.CLIENT_REGISTER_DONE,
          login: true,
        };
      }

      if (response.data.status === ResponseStatus.BANNED) {
        await loading.dismiss();

        const toast = await toastController.create({
          message: response.data.msg,
          duration: 4000,
        });

        await toast.present();

        return {
          status: ResponseStatus.BANNED,
        };
      }

      return;
    } catch (error: any) {
      await loading.dismiss();
      const toastError = await toastController.create({
        message:
          error.message ||
          "Serverda xatolik, dasturni boshqatdan ishga tushiring.",
        duration: 4000,
      });

      await toastError.present();

      return {
        status: ResponseStatus.UNKNOWN_ERR,
      };
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
        const toast = await toastController.create({
          message: "Internet bilan aloqa mavjud emas",
          duration: 4000,
        });

        await toast.present();

        return { status: ResponseStatus.NETWORK_ERR };
      }
      const response = await authHttp.check();

      if (!response || response.status >= 400) {
        const toast = await toastController.create({
          message: `Serverda xatolik yoki internet bilan aloqa mavjud emas.`,
          duration: 3000,
        });

        await toast.present();

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
        const toast = await toastController.create({
          message: response.data.msg,
          duration: 3000,
        });

        await Promise.allSettled([
          Preferences.remove({ key: "clientOneId" }),
          Preferences.remove({ key: "auth_token" }),
          toast.present(),
        ]);
        
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
      const toastError = await toastController.create({
        message:
          error.message ||
          "Serverda xatolik yoki internet bilan aloqa mavjud emas",
        duration: 4000,
        keyboardClose: true,
      });

      await toastError.present();

      return { status: ResponseStatus.UNKNOWN_ERR };
    }
  }

  return {
    clientDetails,
    auth,
    fullname,
    register,
    check,
  };
});
