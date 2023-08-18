import config from "../config";
import { toastController } from "@ionic/vue";
import axios from "axios";

export function authInstance() {
  let baseUrl = config.SERVER_URL + "/auth";

  async function auth(data: any) {
    try {
      const response = await axios.post(baseUrl + "/login", data);
      console.log(response);

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

  async function register(data: any) {
    try {
      const response = await axios.post(baseUrl + "/register", data);

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
