<script setup lang="ts">
//@ts-ignore
import StarRating from "vue-star-rating";
import { computed, ref } from "vue";
import { Button as MainButton } from "@/components/ui/button";
import { CheckCheck } from "lucide-vue-next";

const rating = ref(0);

const handleRating = (payload: number) => {
  rating.value = payload;
};

const ratingText = computed(() => {
  if (rating.value === 0) {
    return "Musr";
  }

  if (rating.value === 1) {
    return "Menga yoqmadi";
  }

  if (rating.value === 2) {
    return "Qoniqarsiz";
  }

  if (rating.value === 3) {
    return "Qoniqarli";
  }

  if (rating.value === 4) {
    return "Yaxshi!";
  }

  if (rating.value === 5) {
    return "Hammasi ajoyib!";
  }
});
</script>

<template>
  <div
    class="main-content bg-primary-foreground text-center relative text-foreground p-6"
  >
    <div class="top font-manrope mb-6 space-y-2">
      <p class="first-text text-xl text-primary font-medium">
        Siz manzilga yetib keldingiz!
      </p>
      <h1 class="text-3xl text-primary font-extrabold price">17,000 so'm</h1>
    </div>
    <div class="middle-rating flex flex-col items-center justify-center">
      <h4 class="font-manrope font-medium text-primary mb-2">
        Safar qanday bo'ldi?
      </h4>
      <StarRating
        :rating="rating"
        :rounded-corners="true"
        :star-size="30"
        :show-rating="false"
        :padding="10"
        @update:rating="handleRating"
      />
      <h1
        class="text-xl mb-6 text-primary font-bold price-text mt-4 font-manrope transition-all"
        :class="[rating > 0 ? 'opacity-100' : 'opacity-0']"
      >
        {{ ratingText }}
      </h1>
    </div>
    <div class="buttons">
      <MainButton class="w-full py-6 font-manrope text-lg flex items-center"
        ><CheckCheck class="mr-2" /> Tugatish</MainButton
      >
    </div>
  </div>
</template>
