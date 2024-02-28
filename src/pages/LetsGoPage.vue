<script setup lang="ts">
import {
  Check,
  ChevronLeft,
  Flag,
  Info,
  Settings2,
  User,
} from "lucide-vue-next";
import { defineAsyncComponent, ref } from "vue";
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

const visible = ref(true);
const sheetHeight = ref(460); // Initial height
const minY = ref(40); // Minimum height
const maxY = ref(460); // Maximum height
const startY = ref(0);
const currentY = ref(0);
const dragging = ref(false);

const onTouchStart = (event: any) => {
  startY.value = event.touches[0].clientY;
  currentY.value = sheetHeight.value;
  dragging.value = true;
};

const onTouchMove = (event: any) => {
  if (!dragging.value) return;

  const deltaY = event.touches[0].clientY - startY.value;
  currentY.value = Math.min(
    maxY.value,
    Math.max(minY.value, sheetHeight.value - deltaY)
  );
};

const onTouchEnd = () => {
  dragging.value = false;
  sheetHeight.value = currentY.value;
};
</script>

<template>
  <div class="letsgo-page h-auto flex flex-col w-full">
    <MainButton @click="goBack" class="mb-4 justify-self-end self-end mr-4"
      ><ChevronLeft class="w-4 h-4 mr-2" /> Orqaga</MainButton
    >
    <transition name="bottom-sheet">
      <div
        v-show="visible"
        :style="{ height: sheetHeight + 'px' }"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        class="main-content bg-primary-foreground text-foreground p-6 custom-style w-full bottom-sheet"
      >
      <div class="swiper-button w-full mb-4 h-1 flex items-center justify-center">
        <div class="swiper h-full w-[80px] bg-gray-300 rounded-full"></div>
      </div>
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
                  :class="[
                    activePlan === plan.name ? 'scale-1' : 'scale-[0.9]',
                  ]"
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
              <User class="w-4 h-4 mr-4" stroke-width="2px" />
              1-maktab, Bobur maktab
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
        <MainButton class="w-full flex items-center"
          ><Check class="w-4 h-4 mr-2" /> Chaqirish</MainButton
        >
      </div>
    </transition>
  </div>
</template>

<style scoped>
.custom-style {
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -8px 8px -2px rgba(0, 0, 0, 0.2);
}

.bottom-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  transition: height 0.3s;
  overflow: hidden;
  padding: 20px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.bottom-sheet-enter-active,
.bottom-sheet-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.bottom-sheet-enter,
.bottom-sheet-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
