<script setup lang="ts">
import {
  DriverArrivedScreen,
  DriverGoingScreen,
  RideActiveScreen,
  RideFinishedScreen,
  SearchingScreen,
  WaitingDuringRideScreen,
} from "@/components/ride";
import { onMounted, ref } from "vue";

type RideStatus =
  | "CLIENT_SEARCH_FOR_TAXI"
  | "RIDE_CANCELLED_BY_CLIENT"
  | "DRIVER_GOING_TO_CLIENT"
  | "DRIVER_ARRIVED_TO_CLIENT"
  | "RIDE_ACTIVE"
  | "DRIVER_WAITING_FOR_CLIENT" //during the ride, client might have to do smth else
  | "RIDE_CANCELLED_BY_DRIVER"
  | "RIDE_FINISHED";

const rideStatus = ref<RideStatus>("DRIVER_ARRIVED_TO_CLIENT");
</script>

<template>
  <div class="ride-page flex flex-col w-full h-auto">
    <SearchingScreen v-if="rideStatus === 'CLIENT_SEARCH_FOR_TAXI'" />
    <DriverGoingScreen v-if="rideStatus === 'DRIVER_GOING_TO_CLIENT'" />
    <DriverArrivedScreen v-if="rideStatus === 'DRIVER_ARRIVED_TO_CLIENT'" />
    <RideActiveScreen v-if="rideStatus === 'RIDE_ACTIVE'" />
    <WaitingDuringRideScreen
      v-if="rideStatus === 'DRIVER_WAITING_FOR_CLIENT'"
    />
    <RideFinishedScreen v-if="rideStatus === 'RIDE_FINISHED'" />
  </div>
</template>
