import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authInstance } from "@/http/instances";
import { toastController, loadingController } from "@ionic/vue";
import { Preferences } from "@capacitor/preferences";

// interface Client {
//   id?: string;
//   oneId?: string;
//   fullname: string;
//   phone: string;
//   password: string;
//   createdAt?: Date;
//   bonus?: string;
//   moneySpent?: string;
//   rides?: object[];
//   status?: string;
//   ban?: object[];
//   lastLogin?: Date;
// }

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
    phone: "",
    password: "",
  });

  const fullname = computed(() => {
    return `${clientDetails.value.firstname} ${clientDetails.value.lastname}`;
  });

  async function auth() {
    const loading = await loadingController.create({
      message: "Yuklanmoqda...",
    });

    const toastWarning = await toastController.create({
      message: "Iltimos, hamma qatorlarni to'ldiring.",
      duration: 4000,
    });

    await loading.present();

    try {
      if (!clientDetails.value.phone) {
        await loading.dismiss();
        await toastWarning.present();
        return {
          status: "warning",
        };
      }

      if (!clientDetails.value.password) {
        await loading.dismiss();
        await toastWarning.present();
        return {
          status: "warning",
        };
      }

      const response = await authHttp.auth({
        client: { ...clientDetails.value, fullname: fullname.value },
      });

      //   Serverda xatolik yoki internet bilan aloqa bo'lmaganida
      if (!response || response.status >= 400) {
        await loading.dismiss();
        throw new Error(
          "Serverda xatolik, internet bilan aloqangizni tekshiring yoki boshqatdan urinib ko'ring."
        );
      }

      // hammasi yaxshi
      if (response.data.status === "ok") {
        await loading.dismiss();

        if (!response.data.registered) {
          return {
            status: "nextStep",
          };
        }

        if (response.data.registered) {

          const { client, token, msg } = await response.data;

          const toast = await toastController.create({
            message: msg,
            duration: 4000,
          });

          await Promise.allSettled([
            toast.present(),
            Preferences.set({ key: "auth_token", value: token }),
            Preferences.set({ key: "clientOneId", value: client.oneId }),
          ]);

          return {
            status: "account-login",
          };
        }
      }

      if (response.data.status === "incorrect-password") {
        await loading.dismiss();

        const toast = await toastController.create({
          message: response.data.msg,
          duration: 4000,
        });

        await toast.present();

        return {
          status: "incorrect-password",
        };
      }

      if (response.data.status === "banned") {
        await loading.dismiss();

        const toast = await toastController.create({
          message: `Akkauntingiz ban qilingan: ${response.data.reason}`,
          duration: 4000,
        });

        await toast.present();

        return {
          status: "banned",
        };
      }
    } catch (error: any) {
      const toastError = await toastController.create({
        message: error.message || "Serverda xatolik",
        duration: 4000,
      });

      await toastError.present();
    }
  }

  async function register() {
    const loading = await loadingController.create({
      message: "Yuklanmoqda...",
    });

    const toastWarning = await loadingController.create({
      message: "Iltimos, hamma qatorlarni to'ldiring.",
    });

    try {
      await loading.present();

      if (!clientDetails.value.firstname) {
        await loading.dismiss();
        await toastWarning.present();
        return {
          status: "warning",
        };
      }

      if (!clientDetails.value.lastname) {
        await loading.dismiss();
        await toastWarning.present();
        return {
          status: "warning",
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
      if (response.data.status === "ok") {

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
        });

        await toast.present();

        return {
          status: "ok",
          login: true,
        };
      }
    } catch (error: any) {
      const toastError = await toastController.create({
        message: error.message || "Serverda xatolik",
      });

      await toastError.present();
    }
  }

  return {
    clientDetails,
    auth,
    fullname,
    register,
  };
});
