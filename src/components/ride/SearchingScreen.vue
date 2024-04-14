<script setup lang="ts">
import { Button as MainButton } from "@/components/ui/button";
import { Ban } from "lucide-vue-next";
import { useMaps } from "@/store/maps";
import { useRoutes } from "@/store/routes";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useGeocoding } from "@/store/geocoding";
import { toast } from "vue-sonner";

const mapsStore = useMaps();
const routesStore = useRoutes();
const geocodingStore = useGeocoding();

const router = useRouter();

const { sharedMap, markerVisible, isRadarVisible } = storeToRefs(mapsStore);
const { destinationAddress, originAddress } = storeToRefs(geocodingStore);

async function cancel() {
  try {
    await mapsStore.enableEvents();
    await router.push("/ride/letsgo");
    await routesStore.getGeometryOfRoute(
      {
        lat: destinationAddress.value?.lat as number,
        lng: destinationAddress.value?.lng as number,
        name: "",
      },
      {
        lat: originAddress.value?.lat as number,
        lng: originAddress.value?.lng as number,
        name: "",
      }
    );
    isRadarVisible.value = false;
    markerVisible.value = false;
    await mapsStore.addFixedMarkers(
      originAddress.value,
      destinationAddress.value
    );
  } catch (error: any) {
    toast.error(
      error.message ||
        error.response.data.msg ||
        "Qandaydir xatolik yuzaga keldi, boshqatdan urinib ko'ring",
      { duration: 4000 }
    );
    console.log(error);
  }
}
</script>

<template>
  <div
    class="main-content bg-primary-foreground text-center text-foreground p-6 custom-style"
  >
    <h1 class="text-foreground font-poppins font-bold text-xl mb-2">
      Siz uchun taxi izlayabmiz...
    </h1>
    <p class="text-foreground font-manrope">
      Eng yaqin haydovchi sizga javob beradi.
    </p>
    <MainButton @click="cancel" class="py-6 text-lg font-manrope w-full mt-4"
      ><Ban class="mr-2" /> Bekor qilish</MainButton
    >
  </div>
</template>

<style scoped>
.custom-style {
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -8px 8px -2px rgba(0, 0, 0, 0.2);
}
</style>
