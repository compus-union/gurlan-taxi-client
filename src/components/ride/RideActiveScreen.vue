<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { CupertinoPane } from "cupertino-pane";
import {
  Banknote,
  Car,
  UserRound,
  Star,
  Phone,
  Ban,
  Flag,
  User,
  AlertCircle,
} from "lucide-vue-next";
import { Button as MainButton } from "@/components/ui/button";
import Separator from "../ui/separator/Separator.vue";

const pane = ref<CupertinoPane>();

onMounted(async () => {
  pane.value = new CupertinoPane(".sheet-pane", {
    breaks: {
      top: { enabled: true, height: 390 },
      middle: { enabled: true, height: 340 },
      bottom: { enabled: true, height: 40 },
    },
    initialBreak: "middle",
    draggableOver: true,
    parentElement: ".app",
    cssClass: "z-50",
    buttonDestroy: false,
  });

  await pane.value.present({ animate: true });
});

onUnmounted(async () => {
  await pane.value?.destroy();
});
</script>

<template>
  <div
    class="main-content sheet-pane bg-primary-foreground text-center relative text-foreground px-6 pt-2"
  >
    <div class="top flex items-center justify-between border-b pb-4">
      <div class="left flex flex-col items-start">
        <h2 class="text-primary font-poppins text-lg font-bold">Yo'l xaqqi</h2>
      </div>
      <div
        class="right space-x-2 flex items-center font-poppins font-semibold text-lg"
      >
        <Banknote />
        <p>17,000 so'm</p>
      </div>
    </div>
    <div class="middle">
      <div class="car flex items-center space-x-2 mt-4">
        <Car />
        <p class="font-poppins font-semibold">Nexia 3</p>
        <div
          class="plate w-auto px-1 font-semibold border border-black rounded font-sans"
        >
          90 A 989 RA
        </div>
      </div>
      <div class="driver flex space-x-4 mt-5">
        <div
          class="avatar inline-flex items-center justify-center font-normal text-foreground select-none shrink-0 bg-secondary overflow-hidden h-12 w-12 text-2xl rounded-full"
        >
          <UserRound />
        </div>
        <div class="names">
          <h3 class="fullname font-poppins font-bold text-lg flex items-center">
            Sharof Rashidov
            <p class="star flex items-center text-sm ml-3 opacity-30">
              <Star class="w-4 h-4 mr-2" /> 4,5
            </p>
          </h3>
          <p class="phone flex items-center font-manrope text-sm font-semibold">
            +998999447613
          </p>
        </div>
      </div>
      <div class="addresses mt-6 space-y-1 text-left">
        <div class="address origin flex items-center justify-between">
          <div
            class="text-part flex items-center font-medium font-manrope flex-1 min-w-0"
          >
            <User class="w-6 h-4 mr-4" stroke-width="2px" />
            <p
              class="overflow-hidden whitespace-nowrap w-full"
              style="text-overflow: ellipsis"
            >
              Vapaevlar xonadoni
            </p>
          </div>
        </div>
        <div class="seperators flex items-center">
          <Separator
            orientation="vertical"
            class="h-10 w-1 rounded bg-black mx-[8px]"
          />
          <Separator class="ml-2" />
        </div>
        <div class="address destination flex items-center justify-between">
          <div
            class="text-part flex items-center font-medium font-manrope flex-1 min-w-0"
          >
            <Flag class="w-6 h-4 mr-4" stroke-width="2px" />
            <p
              class="overflow-hidden whitespace-nowrap w-full"
              style="text-overflow: ellipsis"
            >
              Bobur maktab
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="buttons space-y-4 mt-4">
      <MainButton class="w-full py-6 text-lg font-manrope"
        ><AlertCircle class="w-5 h-5 mr-2" /> Shikoyat qilish</MainButton
      >
    </div>
  </div>
</template>
