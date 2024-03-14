<script setup lang="ts">
import {
  Check,
  ChevronLeft,
  Flag,
  Info,
  Settings2,
  User,
} from "lucide-vue-next";
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref } from "vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import StandardPlanImg from "@/assets/standard.png";
import ComfortPlanImg from "@/assets/comfort.png";
import MicroVanPlanImg from "@/assets/mikrovan.png";
import { useGeocoding } from "@/store/geocoding";
import { storeToRefs } from "pinia";
import { useRoutes } from "@/store/routes";
import Hammer from "hammerjs";

const router = useRouter();
const geocodingStore = useGeocoding();
const routesStore = useRoutes();

const { destinationAddress, originAddress } = storeToRefs(geocodingStore);

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

onBeforeRouteLeave(async (to, from, next) => {
  await routesStore.removeTheGeometryOfRoute();
  return next();
});

const bottomSheet = ref<HTMLElement | null>(null);
const position = ref(0);
const startPosition = ref(0);
const currentHeight = ref(40);
const maxHeight = 460;
const minHeight = 40;
const phase1HeightRange = [40, 100];
const phase2HeightRange = [101, 200];
const phase3HeightRange = [201, 460];
const isHolding = ref(false);
const phase = ref(0);

let hammer: HammerManager;

function handlePanStart(event: HammerInput) {
  isHolding.value = true;
  startPosition.value = position.value;
}

function handlePanMove(event: HammerInput) {
  if (isHolding.value) {
    const deltaY = event.deltaY;
    const newPosition = startPosition.value + deltaY;
    position.value = newPosition;
    currentHeight.value = Math.max(minHeight, Math.min(maxHeight, newPosition));
    if (
      currentHeight.value >= phase1HeightRange[0] &&
      currentHeight.value < phase1HeightRange[1]
    ) {
      phase.value = 1;
    } else if (
      currentHeight.value >= phase2HeightRange[0] &&
      currentHeight.value < phase2HeightRange[1]
    ) {
      phase.value = 2;
    } else {
      phase.value = 3;
    }
    if (phase.value === 1) {
      currentHeight.value = phase1HeightRange[0];
      position.value = 0;
    } else if (phase.value === 2) {
      currentHeight.value = phase2HeightRange[0];
      position.value = -(currentHeight.value - phase1HeightRange[1]);
    } else {
      currentHeight.value = phase3HeightRange[0];
      position.value = -(phase3HeightRange[0] - phase2HeightRange[1]);
    }
  }
}

function handlePanEnd(event: HammerInput) {
  isHolding.value = false;
  if (
    currentHeight.value >= phase1HeightRange[0] &&
    currentHeight.value < phase1HeightRange[1]
  ) {
    phase.value = 1;
  } else if (
    currentHeight.value >= phase2HeightRange[0] &&
    currentHeight.value < phase2HeightRange[1]
  ) {
    phase.value = 2;
  } else {
    phase.value = 3;
  }
  if (phase.value === 1) {
    currentHeight.value = phase1HeightRange[0];
    position.value = 0;
  } else if (phase.value === 2) {
    currentHeight.value = phase2HeightRange[0];
    position.value = -(currentHeight.value - phase1HeightRange[1]);
  } else {
    currentHeight.value = phase3HeightRange[0];
    position.value = -(phase3HeightRange[0] - phase2HeightRange[1]);
  }
}

function handleTouchMove(event: TouchEvent) {
  if (isHolding.value) {
    const deltaY = event.touches[0].clientY - startPosition.value;
    const newPosition = startPosition.value + deltaY;
    position.value = newPosition;
    currentHeight.value = Math.max(minHeight, Math.min(maxHeight, newPosition));
    if (
      currentHeight.value >= phase1HeightRange[0] &&
      currentHeight.value < phase1HeightRange[1]
    ) {
      phase.value = 1;
    } else if (
      currentHeight.value >= phase2HeightRange[0] &&
      currentHeight.value < phase2HeightRange[1]
    ) {
      phase.value = 2;
    } else {
      phase.value = 3;
    }
    if (phase.value === 1) {
      currentHeight.value = phase1HeightRange[0];
      position.value = 0;
    } else if (phase.value === 2) {
      currentHeight.value = phase2HeightRange[0];
      position.value = -(currentHeight.value - phase1HeightRange[1]);
    } else {
      currentHeight.value = phase3HeightRange[0];
      position.value = -(phase3HeightRange[0] - phase2HeightRange[1]);
    }
  }
}

onMounted(() => {
  hammer = new Hammer(bottomSheet.value as HTMLElement | SVGElement);
  hammer.add(new Hammer.Pan({ direction: Hammer.DIRECTION_VERTICAL }));
  hammer.on("panstart", handlePanStart);
  hammer.on("panmove", handlePanMove);
  hammer.on("panend", handlePanEnd);
});

onBeforeUnmount(() => {
  hammer.off("panstart", handlePanStart);
  hammer.off("panmove", handlePanMove);
  hammer.off("panend", handlePanEnd);
  hammer.destroy();
});
</script>

<template>
  <div class="letsgo-page h-auto flex flex-col w-full">
    <MainButton @click="goBack" class="mb-4 justify-self-end self-end mr-4"
      ><ChevronLeft class="w-4 h-4 mr-2" /> Orqaga</MainButton
    >
    <div
      ref="bottomSheet"
      :style="{
        height: `${currentHeight}px`,
        transform: `translateY(${position}px)`,
      }"
      v-touch:move="handleTouchMove"
      class="main-content bg-primary-foreground text-foreground p-6 custom-style w-full bottom-sheet"
    >
      <div
        class="swiper-button w-full mb-4 h-1 flex items-center justify-center"
      >
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
      <p class="text-sm opacity-50 my-2">2km, 15min</p>
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

.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-top: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: height 0.3s ease-out, transform 0.3s ease-out;
}
</style>
