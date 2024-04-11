<script setup lang="ts">
import {
  DriverArrivedScreen,
  DriverGoingScreen,
  RideActiveScreen,
  RideFinishedScreen,
  SearchingScreen,
  WaitingDuringRideScreen,
} from "@/components/ride";
import { CupertinoPane } from "cupertino-pane";
import { onMounted, ref } from "vue";

type RideStatus =
  | "CLIENT_WAITING"
  | "RIDE_CANCELLED_BY_CLIENT"
  | "DRIVER_GOING"
  | "DRIVER_ARRIVED"
  | "RIDE_ACTIVE"
  | "DRIVER_WAITING"
  | "RIDE_CANCELLED_BY_DRIVER"
  | "CLIENT_ARRIVED";

const rideStatus = ref<RideStatus>("CLIENT_WAITING");

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
</script>

<template>
  <div class="ride-page flex flex-col w-full h-auto">
    <SearchingScreen v-if="rideStatus === 'CLIENT_WAITING'" />
    <DriverGoingScreen v-if="rideStatus === 'DRIVER_GOING'" />
    <DriverArrivedScreen v-if="rideStatus === 'DRIVER_ARRIVED'" />
    <RideActiveScreen v-if="rideStatus === 'RIDE_ACTIVE'" />
    <WaitingDuringRideScreen v-if="rideStatus === 'DRIVER_WAITING'" />
  </div>
</template>
