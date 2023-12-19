<script setup lang="ts">
import { Preferences } from "@capacitor/preferences";
import { onBeforeRouteUpdate, useRouter } from "vue-router";
import { onBeforeMount } from "vue";
import { useMaps } from "@/store/maps";
import { useAuth } from "@/store/auth";
import { ResponseStatus } from "@/constants";
import { loadingController } from "@ionic/vue";
import { toast } from "vue3-toastify";

const router = useRouter();
const mapsStore = useMaps();
const authStore = useAuth();

const checkClient = async () => {
  const checkLoading = await loadingController.create({
    message: "Malumotlaringiz tekshirilmoqda...",
  });
  try {
    await checkLoading.present();
    const check = await authStore.check();

    if (
      check?.status === ResponseStatus.TOKEN_NOT_FOUND ||
      check?.status === ResponseStatus.CLIENT_NOT_FOUND ||
      check?.status === ResponseStatus.TOKEN_NOT_VALID ||
      check?.status === ResponseStatus.BANNED
    ) {
      await router.push({ path: "/auth/login" });

      return {
        status: "no",
      };
    } else if (
      check?.status === ResponseStatus.UNKNOWN_ERR ||
      check?.status === ResponseStatus.NETWORK_ERR
    ) {
      return {
        status: "no",
      };
    } else {
      return {
        status: "ok",
      };
    }
  } catch (error: any) {
    toast(error);
    return {
      status: "no",
    };
  } finally {
    await checkLoading.dismiss();
  }
};

onBeforeMount(async () => {
  const loading = await loadingController.create({
    message: "Xarita yuklanmoqda...",
  });

  try {
    const check = await checkClient();

    if (check.status === "no") {
      throw new Error("Xaritani yuklashni imkoni yo'q");
    } else if (check.status === "ok") {
      alert(check.status);
      await loading.present();
      await mapsStore.loadMap("map");
      return;
    } else {
      throw new Error(
        "Qandaydir xatolik yuz berdi, dasturni boshqatdan ishga tushiring"
      );
    }
  } catch (error: any) {
    toast(
      error.response.data.msg ||
        error.message ||
        "Xaritani yuklashda xatolik yuz berdi, dasturni boshqatdan ishga tushiring"
    );
    return;
  } finally {
    await loading.dismiss();
    return;
  }
});
  
const logout = async () => {
  await Preferences.remove({ key: "auth_token" });
  await Preferences.remove({ key: "clientOneId" });

  await router.push("/register");
};
</script>

<template>
  <div class="default-layout">
    <div id="map" class="h-screen">map</div>
    <RouterView class="h-[400px]"></RouterView>
  </div>
</template>

<style scoped>
img[alt="Google"] {
  display: none;
}

div.gmnoprint {
  display: none;
}
</style>
