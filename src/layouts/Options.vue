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
import { List, LogOut, MapPin, User, AlignJustify } from "lucide-vue-next";
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
          <DropdownMenuItem class="text-lg" :class="{'bg-black text-white': $route.path === '/options/profile'}">
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
    <RouterView />
  </div>
</template>
