<script setup lang="ts">
import {
  Check,
  ChevronLeft,
  Flag,
  Info,
  Settings2,
  User,
} from "lucide-vue-next";
import { defineAsyncComponent, onMounted, ref } from "vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import StandardPlanImg from "@/assets/standard.png";
import ComfortPlanImg from "@/assets/comfort.png";
import MicroVanPlanImg from "@/assets/mikrovan.png";
import { useGeocoding } from "@/store/geocoding";
import { storeToRefs } from "pinia";
import { useRoutes } from "@/store/routes";
import { CupertinoPane } from "cupertino-pane";

const router = useRouter();
const geocodingStore = useGeocoding();
const routesStore = useRoutes();

const { destinationAddress, originAddress } = storeToRefs(geocodingStore);
const { price, distance, duration } = storeToRefs(routesStore);

const MainButton = defineAsyncComponent(
  () => import("@/components/ui/button/Button.vue")
);

const Input = defineAsyncComponent(
  () => import("@/components/ui/input/Input.vue")
);

async function goBack() {
  await router.push("/ride/setDestination");
}

type RideTaxi = "taxi" | "delivery";
type PlanType = "Standard" | "Comfort" | "Mikrovan";

interface Plan {
  id: string;
  name: PlanType;
  price: string;
  img: string;
}

const rideType = ref<RideTaxi>("taxi");

const activePlan = ref<PlanType>("Standard");

async function changeActivePlan(plan: PlanType) {
  if (activePlan.value === plan) return;
  activePlan.value = plan;
}

const pane = ref<CupertinoPane>();

onMounted(async () => {
  pane.value = new CupertinoPane(".sheet-pane", {
    breaks: {
      top: { enabled: true, height: 460 },
      middle: { enabled: true, height: 240 },
      bottom: { enabled: true, height: 40 },
    },
    initialBreak: "top",
    draggableOver: true,
    parentElement: ".app",
    cssClass: "z-50",
    buttonDestroy: false,
  });

  await pane.value.present({ animate: true });
});

onBeforeRouteLeave(async (to, from, next) => {
  await routesStore.removeTheGeometryOfRoute();
  await pane.value?.destroy();
  return next();
});
</script>

<template>
  <div class="letsgo-page flex flex-col w-full h-auto">
    <div
      class="sheet-pane main-content bg-primary-foreground text-foreground p-6 w-full h-auto"
    >
      <MainButton
        @click="goBack"
        class="mb-4 justify-self-end self-end mr-4 absolute -top-14 right-0"
        ><ChevronLeft class="w-4 h-4 mr-2" /> Orqaga</MainButton
      >
      <div
        class="ride-type-buttons flex items-center justify-start space-x-3 mb-4"
      >
        <MainButton
          class="px-4"
          :class="{ 'border border-black': rideType === 'taxi' }"
          variant="secondary"
          >Taxi</MainButton
        >
        <MainButton
          class="px-4"
          :class="{ 'border border-black': rideType === 'delivery' }"
          variant="secondary"
          >Yetkazib berish</MainButton
        >
      </div>
      <div class="whitespace-nowrap w-full overflow-x-auto">
        <div class="select-plan flex items-start justify-start space-x-2">
          <button
            v-for="plan in price.planPrices"
            :key="plan.id"
            @click="changeActivePlan(plan.name)"
            class="plan bg-gray-100 rounded-lg p-2 transition border-2 relative h-[102px] flex"
            :class="[
              activePlan === plan.name ? 'border-black' : 'border-gray-100 ',
            ]"
          >
            <div
              class="img object-cover h-[50px] w-[50px] flex items-center justify-center absolute right-2 -top-0.5"
            >
              <img
                :src="plan.img"
                :alt="plan.name"
                class="w-full h-full transition"
                :class="[activePlan === plan.name ? 'scale-1' : 'scale-[0.9]']"
              />
            </div>
            <div class="name-and-price justify-self-end self-end text-left">
              <p>{{ plan.name }}</p>
              <p class="font-bold text-lg">{{ plan.formattedPrice }}</p>
            </div>
          </button>
        </div>
      </div>
      <button
        class="about-plans text-gray-600 flex items-center mt-2 font-semibold text-sm"
      >
        <Info class="w-3 h-3 mr-2" /> Ta'riflar haqida
      </button>
      <Input class="promo-code mt-2" placeholder="Promokod kiriting" />
      <div class="addresses mt-3 space-y-2">
        <div class="address origin flex items-center justify-between">
          <div class="text-part flex items-center font-semibold">
            <User class="w-4 h-4 mr-4" stroke-width="2px" />
            {{ originAddress?.name || originAddress?.displayName }}
          </div>
          <div class="button-part">
            <MainButton variant="ghost" size="icon"
              ><Settings2 class="w-4 h-4"
            /></MainButton>
          </div>
        </div>
        <hr />
        <div class="address destination flex items-center justify-between">
          <div class="text-part flex items-center font-semibold">
            <Flag class="w-4 h-4 mr-4" stroke-width="2px" />
            {{ destinationAddress?.name || destinationAddress?.displayName }}
          </div>
          <div class="button-part">
            <MainButton variant="ghost" size="icon"
              ><Settings2 class="w-4 h-4"
            /></MainButton>
          </div>
        </div>
      </div>
      <p class="text-sm opacity-50 my-2">{{ distance?.kmFull }}, {{ duration?.full }}</p>
      <MainButton class="w-full flex items-center"
        ><Check class="w-4 h-4 mr-2" /> Chaqirish</MainButton
      >
    </div>
  </div>
</template>

<style scoped>
.custom-style {
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -8px 8px -2px rgba(0, 0, 0, 0.2);
}

:deep(.modal-style) {
  box-sizing: border-box;
  color: white;
  background-color: #1d1b20;
  border-radius: 1rem 1rem 0 0;
  z-index: 99999999;

  @media (prefers-color-scheme: light) {
    color: black;
    background-color: #f7f2fa;
    box-shadow: 0 1px 4px 0 rgb(0 0 0 / 37%);
  }
}

.modal-content {
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  outline: 1px solid red;
  outline-offset: -1px;
}
</style>
