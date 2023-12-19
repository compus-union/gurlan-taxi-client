<script setup lang="ts">
import { Preferences } from "@capacitor/preferences";
import { onBeforeRouteUpdate, useRouter } from "vue-router";
import { defineAsyncComponent, onBeforeMount, ref } from "vue";
import { useMaps } from "@/store/maps";
import { useAuth } from "@/store/auth";
import { ResponseStatus } from "@/constants";
import { loadingController } from "@ionic/vue";
import { toast } from "vue3-toastify";
import { HamburgerMenuIcon } from "@radix-icons/vue";

const Button = defineAsyncComponent(
  () => import("@/components/ui/button/Button.vue")
);

const router = useRouter();
const mapsStore = useMaps();
const authStore = useAuth();
const displayErrorMessage = ref(false );

const createLoading = async (message: string) => {
  const loading = await loadingController.create({ message });
  await loading.present();
  return loading;
};

const checkClient = async () => {
  const checkLoading = await createLoading("Malumotlaringiz tekshirilmoqda...");

  try {
    const check = await authStore.check();

    if (
      check?.status === ResponseStatus.TOKEN_NOT_FOUND ||
      check?.status === ResponseStatus.CLIENT_NOT_FOUND ||
      check?.status === ResponseStatus.TOKEN_NOT_VALID ||
      check?.status === ResponseStatus.BANNED
    ) {
      displayErrorMessage.value = true;
      await router.push({ path: "/auth/login" });
      return { status: "no" };
    } else if (
      check?.status === ResponseStatus.UNKNOWN_ERR ||
      check?.status === ResponseStatus.NETWORK_ERR
    ) {
      displayErrorMessage.value = true;
      return { status: "no" };
    } else {
      return { status: "ok" };
    }
  } catch (error: any) {
    displayErrorMessage.value = true;

    toast(error);
    return { status: "no" };
  } finally {
    await checkLoading.dismiss();
  }
};

onBeforeMount(async () => {
  const mapLoading = await createLoading("Xarita yuklanmoqda...");

  try {
    const check = await checkClient();

    if (check.status === "no") {
      throw new Error("Xaritani yuklashni imkoni yo'q");
    }

    await mapsStore.loadMap("map");
  } catch (error: any) {
    toast(
      error.response?.data?.msg ||
        error.message ||
        "Xaritani yuklashda xatolik yuz berdi, dasturni boshqatdan ishga tushiring"
    );
  } finally {
    await mapLoading.dismiss();

    alert(displayErrorMessage.value)
  }
});

const logout = async () => {
  await Preferences.clear();

  await router.push("/auth/login");
};
</script>

<template>
  <div class="default-layout">
    <header v-if="displayErrorMessage === false" class="header bg-primary-foreground fixed top-0 w-full h-auto z-10">
      <nav class="navbar container mx-auto px-1 flex items-center border-b">
        <div class="left">
          <Button size="icon" variant="ghost"><HamburgerMenuIcon class="h-4 w-4" /></Button>
        </div>
        <div class="right ml-2">Bonus: 45,000 so'm</div>
      </nav>
      <aside class="aside fixed h-screen bg-primary-foreground w-[80%] container mx-auto px-2">
        <h2>wow</h2>
      </aside>
    </header>
    <div id="map" class="h-screen">
      <div v-if="displayErrorMessage" class="error-message mt-10 text-center">
        <h1 class="title text-foreground text-2xl font-bold">
          Xatolik yuzaga keldi
        </h1>
        <p>Dasturni boshqatdan ishga tushiring</p>
      </div>
    </div>
    <RouterView
      v-if="displayErrorMessage === false"
      class="h-auto fixed z-10 bottom-0 w-full bg-primary-foreground"
    ></RouterView>
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
