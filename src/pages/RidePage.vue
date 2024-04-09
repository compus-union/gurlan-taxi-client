<script setup lang="ts">
import {} from "@/components/ride"
type RideStatus =
  | "CLIENT_WAITING"
  | "RIDE_CANCELLED_BY_CLIENT"
  | "DRIVER_GOING"
  | "DRIVER_ARRIVED"
  | "RIDE_STARTED"
  | "DRIVER_WAITING"
  | "RIDE_CANCELLED_BY_DRIVER"
  | "CLIENT_ARRIVED";
const props = defineProps<{ rideStatus: RideStatus }>();
</script>

<template></template>
