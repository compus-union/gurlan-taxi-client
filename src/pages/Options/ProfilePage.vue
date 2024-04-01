<script setup lang="ts">
import { AvatarFallback, Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Phone,
  Pencil,
  Wallet,
  Diamond,
  LogOut,
  Trash,
  ArrowLeft,
} from "lucide-vue-next";
import { Button as MainButton } from "@/components/ui/button";
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const fullname = ref("Taxi Mijoz");

const goBack = async () => {
  router.go(-1);
};
</script>

<template>
  <div
    class="profile-page font-manrope h-full w-full bg-primary-foreground px-2"
  >
    <div class="header flex items-center space-x-2 pt-2">
      <MainButton @click="goBack" variant="ghost" size="icon"><ArrowLeft /></MainButton>
      <p class="font-semibold font-manrope text-lg">Profil</p>
    </div>
    <div
      class="first-part h-[140px] border-b flex justify-between items-center w-full"
    >
      <div class="left flex items-center space-x-5">
        <Avatar class="w-20 h-20">
          <AvatarImage
            :src="`https://ui-avatars.com/api/?background=FCDC2A&color=fff&name=${fullname}&format=svg`"
          />
          <AvatarFallback>Yuklanmoqda...</AvatarFallback>
        </Avatar>
        <div class="info">
          <h1 class="text-primary text-xl font-manrope font-semibold">
            {{ fullname }}
          </h1>
          <p class="flex items-center opacity-40 font-poppins font-semibold">
            <Phone class="w-5 h-5 mr-2" /> +998 99 944 76 13
          </p>
        </div>
      </div>
      <div class="action">
        <MainButton size="icon"><Pencil /></MainButton>
      </div>
    </div>
    <div class="middle">
      <div class="bonus py-4 section flex justify-between items-center">
        <div class="left mr-5">
          <p
            class="title flex items-center font-manrope font-bold text-xl mb-2"
          >
            <Wallet class="w-6 h-6 mr-2" /> Bonus
          </p>
          <p class="opacity-50 font-bold font-manrope">
            Har bir buyurtmadan 1,500 so’m bonusga ega bo’ling!
          </p>
        </div>
        <div class="right">
          <h1 class="text-primary font-poppins font-bold text-2xl text-nowrap">
            45,000 so'm
          </h1>
        </div>
      </div>
      <div class="divider w-full h-5 bg-gray-100"></div>
      <div class="promocode py-4 section flex justify-between items-center">
        <div class="left mr-5">
          <p
            class="title flex items-center font-manrope font-bold text-xl mb-2"
          >
            <Diamond class="w-6 h-6 mr-2" /> Promokod
          </p>
          <p class="opacity-50 font-bold font-manrope">
            Ilovamizdan birinchi foydalanayotgan do’stingizga shu promokodni
            ko’rsating!
          </p>
        </div>
        <div class="right">
          <h1 class="text-primary font-poppins font-bold text-2xl text-nowrap">
            PFXQ2
          </h1>
        </div>
      </div>
      <div class="divider w-full h-5 bg-gray-100"></div>
      <div class="buttons space-x-4 my-4">
        <MainButton class="font-manrope font-semibold"
          ><Trash class="w-4 h-4 mr-2" />Accountni o'chirish</MainButton
        >
        <MainButton variant="outline" class="font-manrope font-semibold"
          ><LogOut class="w-4 h-4 mr-2" />Chiqish</MainButton
        >
      </div>
    </div>
  </div>
</template>
