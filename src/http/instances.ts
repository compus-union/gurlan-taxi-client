import { CapacitorHttp, HttpOptions } from "@capacitor/core";
import config from "../config";
import { toastController } from "@ionic/vue";

type RequestOptions = Omit<HttpOptions, "url">;

export function authInstance() {
  let baseUrl = config.SERVER_URL + "/auth";

  async function auth(options: RequestOptions) {
    try {
      const response = await CapacitorHttp.post({
        url: baseUrl + "/auth",
        ...options,
      });

      return response;
    } catch (error: any) {
      console.log(error);
      const toast = await toastController.create({
        message: error.message,
        duration: 2000,
      });

      await toast.present();
    }
  }

  async function register(options: RequestOptions) {
    try {
      const response = await CapacitorHttp.post({
        url: baseUrl + "/register",
        ...options,
      })

      return response;
    } catch (error: any) {
      console.log(error);
      const toast = await toastController.create({
        message: error.message,
        duration: 2000,
      });

      await toast.present();
    }
  }

  return { auth, register };
}
