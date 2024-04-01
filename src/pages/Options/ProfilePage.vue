<script setup lang="ts">
import { AvatarFallback, Avatar, AvatarImage } from "@/components/ui/avatar";
import { Phone } from "lucide-vue-next";
</script>

<template>
  <div class="profile-page font-manrope h-full w-full bg-primary-foreground px-2">
    <div class="first-part h-[140px] border-b flex justify-center items-center">
      <Avatar class="w-20 h-20">
        <AvatarImage
          :src="`https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=Sardor+Aminov&format=svg`"
        />
        <AvatarFallback>Yuklanmoqda...</AvatarFallback>
      </Avatar>
      <div class="info">
        <h1 class="text-primary text-xl font-manrope">Sardor Aminov</h1>
        <p><Phone/> +998 99 944 76 13</p>
      </div>
    </div>
    <div class="middle">
    </div>
  </div>
</template>
