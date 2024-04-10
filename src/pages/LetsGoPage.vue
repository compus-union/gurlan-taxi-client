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
import { useGeocoding } from "@/store/geocoding";
import { storeToRefs } from "pinia";
import { useRoutes } from "@/store/routes";
import { CupertinoPane } from "cupertino-pane";
import { useMaps } from "@/store/maps";
import { useDestination } from "@/store/destination";
import { toast } from "vue3-toastify";
import { Separator } from "@/components/ui/separator";

const router = useRouter();
const geocodingStore = useGeocoding();
const routesStore = useRoutes();
const mapsStore = useMaps();
const destinationStore = useDestination();

const { destinationAddress, originAddress } = storeToRefs(geocodingStore);
const { price, distance, duration, geoJSONs, isRouteInstalled } =
  storeToRefs(routesStore);
const { sharedMap, markerVisible, defaultZoom } = storeToRefs(mapsStore);
const { coords: destinationCoords } = storeToRefs(destinationStore);

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
type PlanType = "STANDARD" | "COMFORT" | "MICROVAN";

const rideType = ref<RideTaxi>("taxi");

const activePlan = ref<PlanType>("COMFORT");

async function changeActivePlan(plan: PlanType) {
  if (activePlan.value === plan) return;
  activePlan.value = plan;
}

const pane = ref<CupertinoPane>();

onMounted(async () => {
  console.log(sharedMap.value);

  pane.value = new CupertinoPane(".sheet-pane", {
    breaks: {
      top: { enabled: true, height: 600 },
      middle: { enabled: true, height: 440 },
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

async function removeTheGeometryOfRoute() {
  try {
    isRouteInstalled.value = null;

    if (!geoJSONs.value) return;

    markerVisible.value = true;
    price.value = {};
    distance.value = {} as { kmFixed: string; kmFull: string };
    duration.value = {} as {
      full: string;
      hours: string;
      minutes: string;
      seconds: string;
    };

    sharedMap.value?.removeLayer(geoJSONs.value as any);
    sharedMap.value?.setView(
      [destinationCoords.value.lat, destinationCoords.value.lng],
      defaultZoom.value
    );
    geoJSONs.value = {} as L.LayerGroup;

    const originMarkerFixed = await mapsStore.findMarker("origin-marker-fixed");
    const destinationMarkerFixed = await mapsStore.findMarker(
      "destination-marker-fixed"
    );

    if (originMarkerFixed) await mapsStore.removeMarker(originMarkerFixed);
    if (destinationMarkerFixed)
      await mapsStore.removeMarker(destinationMarkerFixed);

    return;
  } catch (error: any) {
    toast("Qandaydir xatolik yuzaga keldi");
  }
}

onBeforeRouteLeave(async (to, from, next) => {
  await removeTheGeometryOfRoute();
  await pane.value?.destroy();
  return next();
});

// https://firebasestorage.googleapis.com/v0/b/taxi-app-test-395406.appspot.com/o/client-app%2Fstandard.png?alt=media&token=579297ce-3241-4e1d-9c1d-1fc4e022d194
// https://firebasestorage.googleapis.com/v0/b/taxi-app-test-395406.appspot.com/o/client-app%2Fcomfort.png?alt=media&token=93fd4744-3653-4f5a-b467-9b7b705b8eb8
// https://firebasestorage.googleapis.com/v0/b/taxi-app-test-395406.appspot.com/o/client-app%2Fmicrovan.png?alt=media&token=ddab7624-c4a2-421e-bbdd-8e476c2348c5
</script>

<template>
  <div class="letsgo-page flex flex-col w-full h-auto">
    <div
      class="sheet-pane main-content bg-primary-foreground text-foreground p-6 w-full h-auto"
    >
      <MainButton
        @click="goBack"
        class="mb-4 justify-self-end self-end mr-4 absolute -top-14 right-0 font-manrope"
        ><ChevronLeft class="w-4 h-4 mr-2" /> Orqaga</MainButton
      >
      <div
        class="ride-type-buttons flex items-center justify-start space-x-3 mb-4"
      >
        <MainButton
          class="px-4 font-manrope"
          :class="{ 'border border-black': rideType === 'taxi' }"
          variant="secondary"
          >Taxi</MainButton
        >
        <MainButton
          class="px-4 font-manrope"
          :class="{ 'border border-black': rideType === 'delivery' }"
          variant="secondary"
          >Yetkazib berish</MainButton
        >
      </div>
      <div class="whitespace-nowrap w-full overflow-x-scroll">
        <div
          class="select-plan flex items-start justify-start space-x-2 overflow-x-scroll w-max"
        >
          <button
            v-for="plan in price.planPrices"
            :key="plan.id"
            @click="changeActivePlan(plan.name)"
            class="plan bg-gray-100 rounded-3xl transition border-gray-100 relative h-[160px] w-[260px] flex overflow-hidden"
          >
            <div
              :class="[
                activePlan === plan.name
                  ? 'bg-yellow border-black -translate-x-8'
                  : 'bg-gray-200 border-transparent -translate-x-24',
              ]"
              class="bg-overlay absolute w-full h-[57%] border -top-4 right-0 rounded-[30px] transition-all"
            ></div>
            <div
              :class="[
                activePlan === plan.name
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-25 -translate-x-12',
              ]"
              class="img object-cover h-[52px] w-auto flex items-center justify-center absolute left-0 top-6 transition-all"
            >
              <img
                loading="lazy"
                :src="plan.img"
                :alt="plan.name"
                class="w-full h-full transition z-50"
              />
            </div>
            <div class="name-and-price justify-self-end self-end text-left p-4">
              <p class="font-manrope font-bold text-gray-400">
                {{ plan.name }}
              </p>
              <p class="font-extrabold font-poppins text-xl">
                {{ plan.formattedPrice }}
              </p>
            </div>
          </button>
        </div>
      </div>
      <button
        class="about-plans text-gray-600 flex items-center mt-2 font-semibold text-sm"
      >
        <Info class="w-3 h-3 mr-2" /> Ta'riflar haqida
      </button>
      <Input
        class="promo-code mt-2 placeholder:font-manrope font-manrope"
        placeholder="Promokod kiriting"
      />
      <div class="addresses mt-3 space-y-1">
        <div class="address origin flex items-center justify-between">
          <div class="text-part flex items-center font-medium font-manrope">
            <User class="w-4 h-4 mr-4" stroke-width="2px" />
            {{ originAddress?.name || originAddress?.displayName }}
          </div>
          <div class="button-part">
            <MainButton variant="ghost" size="icon"
              ><Settings2 class="w-4 h-4"
            /></MainButton>
          </div>
        </div>
        <div class="seperators flex items-center">
          <Separator
            orientation="vertical"
            class="h-10 w-1 rounded bg-black mx-[6px]"
          />
          <Separator class="ml-2" />
        </div>
        <div class="address destination flex items-center justify-between">
          <div class="text-part flex items-center font-medium font-manrope">
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
      <p class="text-sm opacity-50 my-2">
        {{ distance?.kmFull }}, {{ duration?.full }}
      </p>
      <MainButton
        class="flex items-center transition-all py-6 text-lg font-manrope font-semibold w-full mb-2"
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
