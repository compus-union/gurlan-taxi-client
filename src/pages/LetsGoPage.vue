<script setup lang="ts">
import { Check, ChevronLeft, Flag, Info, Settings2, User } from "lucide-vue-next";
import { defineAsyncComponent, ref, watch } from "vue";
import { useRouter } from "vue-router";
import StandardPlanImg from "@/assets/standard.png";
import ComfortPlanImg from "@/assets/comfort.png";
import MicroVanPlanImg from "@/assets/mikrovan.png";

const router = useRouter();

const MainButton = defineAsyncComponent(
  () => import("@/components/ui/button/Button.vue")
);

const Input = defineAsyncComponent(
  () => import("@/components/ui/input/Input.vue")
);

const Select = defineAsyncComponent(
  () => import("@/components/ui/select/Select.vue")
);
const SelectContent = defineAsyncComponent(
  () => import("@/components/ui/select/SelectContent.vue")
);
const SelectGroup = defineAsyncComponent(
  () => import("@/components/ui/select/SelectGroup.vue")
);
const SelectItem = defineAsyncComponent(
  () => import("@/components/ui/select/SelectItem.vue")
);
const SelectLabel = defineAsyncComponent(
  () => import("@/components/ui/select/SelectLabel.vue")
);
const SelectTrigger = defineAsyncComponent(
  () => import("@/components/ui/select/SelectTrigger.vue")
);
const SelectValue = defineAsyncComponent(
  () => import("@/components/ui/select/SelectValue.vue")
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
            class="plan bg-gray-100 rounded-lg p-2 transition border relative h-[102px] flex"
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
              <p class="font-bold text-lg">{{ plan.price }} so'm</p>
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
            <User class="w-4 h-4 mr-4"  stroke-width="2px"/>
            1-maktab, Bobur maktab
          </div>
          <div class="button-part">
            <MainButton variant="ghost" size="icon"
              ><Settings2 class="w-4 h-4"
            /></MainButton>
          </div>
        </div>
        <hr>
        <div class="address destination flex items-center justify-between">
          <div class="text-part flex items-center font-semibold">
            <Flag class="w-4 h-4 mr-4"  stroke-width="2px"/>
            2-maktab, Makarenko
          </div>
          <div class="button-part">
            <MainButton variant="ghost" size="icon" 
              ><Settings2 class="w-4 h-4"
            /></MainButton>
          </div>
        </div>
      </div>
      <p class="text-sm opacity-50 my-2">2km, 15min</p>
      <MainButton class="w-full flex items-center"><Check class="w-4 h-4 mr-2"/> Chaqirish</MainButton>
    </div>
  </div>
</template>

<style scoped>
.custom-style {
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -8px 8px -2px rgba(0, 0, 0, 0.2);
}
</style>
