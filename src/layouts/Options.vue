<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";
import { RouterView } from "vue-router";
import { List, LogOut, MapPin, User, AlignJustify, Map } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import { PageTransition } from "vue3-page-transition";

const router = useRouter();
const route = useRoute();

const navigatePage = async (path: string) => {
  await router.push(path);
};
</script>

<template>
  <div class="options-layout">
    <nav
      class="navbar container mx-auto px-1 flex items-center border-b shadow-lg"
    >
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button size="icon" variant="ghost" class="hover:bg-none"
            ><AlignJustify class="h-4 w-4" /></Button
        ></DropdownMenuTrigger>
        <DropdownMenuContent class="font-manrope font-semibold space-y-2">
          <DropdownMenuItem
            class="text-lg"
            :class="{
              'bg-black text-white': route.path === '/ride/setOrigin',
            }"
            @click="navigatePage('/ride/setOrigin')"
          >
            <Map class="w-5 h-5 mr-2" /> Buyurtma berish
          </DropdownMenuItem>
          <DropdownMenuItem
            class="text-lg"
            :class="{
              'bg-black text-white': route.path === '/options/profile',
            }"
          >
            <User class="w-5 h-5 mr-2" /> Profil
          </DropdownMenuItem>
          <DropdownMenuItem class="text-lg">
            <MapPin class="w-5 h-5 mr-2" /> Saqlangan joylar
          </DropdownMenuItem>
          <DropdownMenuItem class="text-lg">
            <List class="w-5 h-5 mr-2" /> Buyurtmalar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="text-lg text-red-500">
            <LogOut class="w-5 h-5 mr-2" /> Chiqish
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div class="right my-4 ml-2 text-lg font-semibold font-manrope">
        Bonus: 45,000 so'm
      </div>
    </nav>

    <router-view v-slot="{ Component }">
      <PageTransition name="fade-in-up" appear>
        <component :is="Component" />
      </PageTransition>
    </router-view>
  </div>
</template>

<style></style>
