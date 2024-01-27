<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";
import { defineAsyncComponent, ref } from "vue";
import { Map, List, User, MapPin, LogOut, Trash2 } from "lucide-vue-next";
import { useRoute } from "vue-router";
import { useSwipe } from "@vueuse/core";

const Button = defineAsyncComponent(() => {
  return import("@/components/ui/button/Button.vue");
});
const ScrollArea = defineAsyncComponent(() => {
  return import("@/components/ui/scroll-area/ScrollArea.vue");
});

const route = useRoute();

const emit = defineEmits<{
  (e: "update:closeAside"): void;
}>();

type Props = {
  showAside: boolean;
};

const props = defineProps<Props>();

const asideTarget = ref<HTMLElement | null>();
const {} = useSwipe(asideTarget, {
  onSwipeEnd(e, direction) {
    if (direction === "left") {
      emit("update:closeAside");
    }
  },
});

onClickOutside(asideTarget, () => emit("update:closeAside"));
</script>

<template>
  <aside
    v-show="props.showAside"
    ref="asideTarget"
    class="aside fixed h-screen left-0 top-0 bg-primary-foreground w-[300px] container mx-auto px-2 shadow-lg flex flex-col justify-between"
  >
    <ScrollArea class="first-part mb-4 mt-3 space-y-2 h-[585px]">
      <h2 class="title font-bold text-2xl mb-4">Menu</h2>
      <Button
        :variant="route.path === '/ride/setOrigin' ? 'default' : 'secondary'"
        class="w-full flex flex-row items-center justify-start text-lg py-6 mb-2"
        ><Map class="mr-2" :size="20" /> Buyurtma berish</Button
      >
      <Button
        :variant="route.path === '/ride/history' ? 'default' : 'secondary'"
        class="w-full flex flex-row items-center justify-start text-lg py-6 mb-2"
        ><List class="mr-2" :size="20" />Tarix</Button
      >
      <Button
        :variant="route.path === '/ride/saved-places' ? 'default' : 'secondary'"
        class="w-full flex flex-row items-center justify-start text-lg py-6 mb-2"
        ><MapPin class="mr-2" :size="20" />Saqlangan joylar</Button
      >
      <Button
        :variant="route.path === '/ride/profile' ? 'default' : 'secondary'"
        class="w-full flex flex-row items-center justify-start text-lg py-6 mb-2"
        ><User class="mr-2" :size="20" />Profil</Button
      >
    </ScrollArea>
    <div class="second-part my-4 space-y-2">
      <Button
        class="w-full flex flex-row items-center justify-start text-lg py-6"
        ><LogOut class="mr-2" :size="20" /> Chiqish</Button
      >
      <Button
        variant="destructive"
        class="w-full flex flex-row items-center justify-start text-lg py-6"
        ><Trash2 class="mr-2" :size="20" />Akkauntni o'chirish</Button
      >
    </div>
  </aside>
</template>

<style scoped>
.aside {
  box-shadow: 4px 0px 8px 0px rgba(0, 0, 0, 0.2);
}
</style>
