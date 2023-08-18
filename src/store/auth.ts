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
    });

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

      await loading.present();
      const response = await authHttp.auth({
        data: { client: { ...clientDetails.value, fullname: fullname.value } },
      });

      //   Serverda xatolik yoki internet bilan aloqa bo'lmaganida
      if (!response || response.status >= 400) {
        await loading.dismiss();
        throw new Error(
          "Serverda xatolik, internet bilan aloqangizni tekshiring yoki boshqatdan urinib ko'ring."
        );
      }

      //   Clientni akkaunti hali tizimda bo'lmaganida
      if (!response.data.registered) {
        await loading.dismiss();
        return {
          registered: false,
          status: "nextStep",
        };
      }

      //   Clientni akkaunti hali tizimda mavjud, lekin ban qilingan vaqtda
      if (response.data.registered && response.data.ban.banned) {
        await loading.dismiss();

        const toast = await toastController.create({
          message: `Akkauntingiz ban qilingan: ${response.data.ban.reason}`,
        });

        await toast.present();

        return {
          registered: true,
          status: "banned",
        };
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

  async function register() {
    const loading = await loadingController.create({
      message: "Yuklanmoqda...",
    });

    const toastWarning = await loadingController.create({
      message: "Iltimos, hamma qatorlarni to'ldiring.",
    });

    try {
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

      await loading.present();
      const response = await authHttp.register({
        data: { client: { ...clientDetails.value, fullname: fullname.value } },
      });

      //   Serverda xatolik yoki internet bilan aloqa bo'lmaganida
      if (!response || response.status >= 400) {
        await loading.dismiss();
        throw new Error(
          "Serverda xatolik, internet bilan aloqangizni tekshiring yoki boshqatdan urinib ko'ring."
        );
      }

      //   Clientni akkaunti hali tizimda mavjud, lekin ban qilingan vaqtda
      if (response.data.ban.banned) {
        await loading.dismiss();

        const toast = await toastController.create({
          message: `Akkauntingiz ban qilingan: ${response.data.ban.reason}`,
        });

        await toast.present();

        return {
          registered: true,
          status: "banned",
        };
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
  };
});
