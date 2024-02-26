<script setup lang="ts">
import { ChevronLeft } from "lucide-vue-next";
import { defineAsyncComponent, ref } from "vue";
import { useRouter } from "vue-router";
import StandardPlanImg from "@/assets/standard.png";
import ComfortPlanImg from "@/assets/comfort.png";
import MicroVanPlanImg from "@/assets/mikrovan.png";

const router = useRouter();

const MainButton = defineAsyncComponent(
  () => import("@/components/ui/button/Button.vue")
);

const ScrollArea = defineAsyncComponent(
  () => import("@/components/ui/scroll-area/ScrollArea.vue")
);

async function goBack() {
  await router.push("/side/setDestination");
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

const plans = ref<Plan[]>([
  { id: "1", name: "Standard", price: "7,000", img: StandardPlanImg },
  { id: "2", name: "Comfort", price: "9,000", img: ComfortPlanImg },
  { id: "3", name: "Mikrovan", price: "9,500", img: MicroVanPlanImg },
]);

const activePlan = ref<PlanType>("Standard");

async function changeActivePlan(plan: PlanType) {
  if (activePlan.value === plan) return;
  activePlan.value = plan;
}
</script>

<template>
  <div class="letsgo-page h-auto flex flex-col w-full">
    <MainButton @click="goBack" class="mb-4 justify-self-end self-end mr-4"
      ><ChevronLeft class="w-4 h-4 mr-2" /> Orqaga</MainButton
    >
    <div
      class="main-content bg-primary-foreground text-foreground p-6 custom-style w-full"
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
            v-for="plan in plans"
            :key="plan.id"
            @click="changeActivePlan(plan.name)"
            class="plan bg-gray-100 rounded-lg p-2 transition border relative h-[130px] flex"
            :class="[
              activePlan === plan.name ? 'border-black' : 'border-gray-100 ',
            ]"
          >
            <div
              class="img object-cover h-[60px] w-[60px] flex items-center justify-center absolute right-2 top-2"
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
              <p class="font-bold">{{ plan.price }} so'm</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-style {
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -8px 8px -2px rgba(0, 0, 0, 0.2);
}
</style>
