import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authInstance } from "@/http/instances";
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

    // set up loading

    // const toastWarning = await toastController.create({
    //   message: "Iltimos, hamma qatorlarni to'ldiring.",
    //   duration: 4000,
    //   keyboardClose: true,
    // });

    // set up warning toast

    try {
      if (!clientDetails.value.phone) {
        // await loading.dismiss();
        // dismiss loading

        // await toastWarning.present();
        // show warning toast
        return {
          status: ResponseStatus.AUTH_WARNING,
        };
      }

      if (!clientDetails.value.password) {
        // await loading.dismiss();
        // dismiss loading

        // await toastWarning.present();
        // show warning toast
        return {
          status: ResponseStatus.AUTH_WARNING,
        };
      }

      if (!networkStatus.connected) {
        // const noInternetToast = await toastController.create({
        //   message: "Server bilan aloqa mavjud emas",
        //   duration: 4000,
        // });

        // await noInternetToast.present();

        // no internet toast
        return {
          status: ResponseStatus.NETWORK_ERR,
        };
      }

      const response = await authHttp.auth({
        client: { ...clientDetails.value, fullname: fullname.value },
      });

      // Serverda xatolik yoki internet bilan aloqa bo'lmaganida
      if (!response || response.status >= 400) {
        // await loading.dismiss();

        // dismiss loading
        // no internet toast

        return;
      }

      // hammasi yaxshi
      if (
        response.data.status === ResponseStatus.CLIENT_READY_TO_REGISTER &&
        !response.data.registered
      ) {
        // dismiss loading

        return {
          status: "nextStep",
        };
      }

      if (response.data.status === ResponseStatus.AUTH_WARNING) {
        // dismiss loading

        // show msg in the toast

        return;
      }

      if (response.data.status === ResponseStatus.BANNED) {
        // dismiss loading

        // show msg in the toast

        await Promise.allSettled([
          // toast.present(),
          Preferences.remove({ key: "clientOneId" }),
          Preferences.remove({ key: "auth_token" }),
        ]);

        return {
          status: ResponseStatus.BANNED,
        };
      }

      if (response.data.status === ResponseStatus.CLIENT_LOGIN_DONE) {
        // dismisss loading

        // show msg in the toast

        await Promise.allSettled([
          // toast.present(),
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
      // show msg in the toast

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

    // set up loading

    // const toastWarning = await toastController.create({
    //   message: "Iltimos, hamma qatorlarni to'ldiring.",
    //   duration: 4000,
    //   keyboardClose: true,
    // });

    // set up warning toast
    try {
      // set up loading

      if (!clientDetails.value.firstname) {
        // dismiss loading
        // show toast
        return {
          status: ResponseStatus.AUTH_WARNING,
        };
      }

      if (!clientDetails.value.lastname) {
        // dismiss loading
        // show toast
        return {
          status: ResponseStatus.AUTH_WARNING,
        };
      }

      if (!networkStatus.connected) {
        // dismiss loading

        // show toast
        return {
          status: ResponseStatus.NETWORK_ERR,
        };
      }

      const response = await authHttp.register({
        client: { ...clientDetails.value, fullname: fullname.value },
      });

      //  Serverda xatolik yoki internet bilan aloqa bo'lmaganida
      if (!response || response.status >= 400) {
        // dismiss loading

        throw new Error(
          "Serverda xatolik, internet bilan aloqangizni tekshiring yoki boshqatdan urinib ko'ring."
        );
      }

      //  Hammasi yaxshi
      if (response.data.status === ResponseStatus.CLIENT_REGISTER_DONE) {
        const promises = [
          // dismiss loading

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

        // show toast

        return {
          status: ResponseStatus.CLIENT_REGISTER_DONE,
          login: true,
        };
      }

      if (response.data.status === ResponseStatus.BANNED) {
        // dismiss loading

        //  show toast

        return {
          status: ResponseStatus.BANNED,
        };
      }

      return;
    } catch (error: any) {
      // dismiss loading

      //  show toast

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
        // show toast

        return { status: ResponseStatus.NETWORK_ERR };
      }
      const response = await authHttp.check();

      if (!response || response.status >= 400) {
        // show toast

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
        // show toast

        await Promise.allSettled([
          Preferences.remove({ key: "clientOneId" }),
          Preferences.remove({ key: "auth_token" }),
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
      //  show toast
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
