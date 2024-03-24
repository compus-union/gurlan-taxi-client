<script setup lang="ts">
import { toRef } from "vue";
const props = defineProps<{ isAnimated: boolean }>();

const isAnimatedRef = toRef(props, "isAnimated");
</script>

<template>
  <svg
    width="52"
    height="91"
    viewBox="0 0 52 91"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="26" cy="26" r="26" fill="black" />
    <path
      d="M22 50H30V87C30 89.2091 28.2091 91 26 91V91C23.7909 91 22 89.2091 22 87V50Z"
      fill="black"
      class="transition-all"
      :class="[isAnimatedRef ? '-translate-y-5' : '']"
    />
    <circle
      :class="[isAnimatedRef ? 'animate-bounce-horizontal' : '']"
      class="transition-all"
      cx="26"
      cy="26"
      r="5"
      fill="white"
    />
    <ellipse
      cx="26"
      cy="88.5"
      rx="6"
      ry="2.5"
      fill="black"
      fill-opacity="0.44"
      :class="[isAnimatedRef ? '' : 'hidden']"
    />
  </svg>
</template>

<style scoped>
@keyframes bounce-horizontal {
  0% {
    transform: translateX(0);
    animation-timing-function: linear;
  }
  25% {
    transform: translateX(23%);
    animation-timing-function: linear;
  }
  50% {
    transform: translateX(0);
    animation-timing-function: linear;
  }
  75% {
    transform: translateX(-23%);
    animation-timing-function: linear;
  }
  100% {
    transform: translateX(0);
    animation-timing-function: linear;
  }
}

.animate-bounce-horizontal {
  animation: bounce-horizontal 1s infinite;
}
</style>
