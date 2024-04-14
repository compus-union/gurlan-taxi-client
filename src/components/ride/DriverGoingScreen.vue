<script setup lang="ts">
import { onMounted, ref } from "vue";
import { CupertinoPane } from "cupertino-pane";
import {
  Banknote,
  Navigation,
  Car,
  UserRound,
  Star,
  Timer,
} from "lucide-vue-next";

const pane = ref();
</script>

<template>
  <div
    class="main-content bg-primary-foreground text-center text-foreground p-6 custom-style"
  >
    <div class="top">
      <div class="left">
        <p class="text-primary-foreground font-poppins text-gray-400">
          Haydovchi manzili
        </p>
      </div>
      <div class="right"></div>
    </div>
  </div>
</template>

<style scoped>
.custom-style {
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -8px 8px -2px rgba(0, 0, 0, 0.2);
}
</style>
