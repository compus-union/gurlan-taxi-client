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
  RotateCcw,
} from "lucide-vue-next";
import { Button as MainButton } from "@/components/ui/button";
import { computed, onMounted, ref, watch } from "vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import { useClient } from "@/store/client";
import { storeToRefs } from "pinia";
import { useLoading } from "@/store/loading";
import { toast } from "vue3-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { vMaska } from "maska";
import DialogClose from "@/components/ui/dialog/DialogClose.vue";

const clientStore = useClient();
const loadingStore = useLoading();
const router = useRouter();

const { client, fullnameSplitted } = storeToRefs(clientStore);
const { loading } = storeToRefs(loadingStore);

const error = ref(false);

const goBack = async () => {
  router.go(-1);
};

onBeforeRouteLeave(async (to, from, next) => {
  if (to.path === "/ride/letsgo") {
    return next("/ride/setOrigin");
  }

  return next();
});

async function getAccount() {
  try {
    const result = await clientStore.getClient();

    if (!result) {
      error.value = true;
      toast("Xatolik yuzaga keldi, boshqatdan urinib ko'ring");

      return;
    }

    if (error) error.value = false;
    return;
  } catch (error: any) {
    error.value = true;

    toast(
      error.response.data.msg ||
        error.message ||
        "Qandaydir muammo yuzaga keldi, dasturni boshqatdan ishga tushiring."
    );
  }
}

onMounted(async () => {
  await getAccount();
});

const newClientToUpdate = ref({
  firstname: "",
  lastname: "",
});
const fullname = computed(
  () =>
    newClientToUpdate.value.firstname + " " + newClientToUpdate.value.lastname
);

async function updatePersonalInfo(e: Event) {
  e.preventDefault();
  try {
    const result = await clientStore.updatePersonalInfo(fullname.value);

    if (result?.status !== "ok") {
      return;
    }

    await getAccount()
  } catch (error) {
    console.log(error);
  }
}

const buttonDisabled = computed(() => {
  if (newClientToUpdate.value.firstname || newClientToUpdate.value.lastname) {
    return false;
  }

  return true;
});
</script>

<template>
  <div
    class="profile-page font-manrope h-full w-full bg-primary-foreground px-2"
  >
    <div class="header flex items-center space-x-2 pt-2">
      <MainButton @click="goBack" variant="ghost" size="icon"
        ><ArrowLeft
      /></MainButton>
      <p class="font-semibold font-manrope text-lg">Profil</p>
    </div>
    <div
      v-show="!loading && !error"
      class="first-part h-[140px] border-b flex justify-between items-center w-full"
    >
      <div class="left flex items-center space-x-5">
        <Avatar class="w-20 h-20">
          <AvatarImage
            :src="`https://ui-avatars.com/api/?background=FCDC2A&color=fff&name=${client?.fullname}&format=svg`"
          />
          <AvatarFallback>Yuklanmoqda...</AvatarFallback>
        </Avatar>
        <div class="info">
          <h1 class="text-primary text-xl font-manrope font-semibold">
            {{ client?.fullname }}
          </h1>
          <p class="flex items-center opacity-40 font-poppins font-semibold">
            <Phone class="w-5 h-5 mr-2" /> {{ client?.phone }}
          </p>
        </div>
      </div>
      <div class="action">
        <Dialog>
          <DialogTrigger as-child>
            <MainButton size="icon"><Pencil /></MainButton>
          </DialogTrigger>
          <DialogContent class="rounded-lg font-manrope">
            <DialogHeader class="text-left">
              <DialogTitle class="text-xl font-poppins font-bold"
                >Yangilash</DialogTitle
              >
              <DialogDescription class="text-base">
                Tugatganingizdan keyin "Saqlash" tugmasini bosing
              </DialogDescription>
            </DialogHeader>
            <div class="flex flex-col py-4 space-y-4">
              <div class="flex flex-col items-start">
                <Label for="firstName" class="text-right text-lg font-bold">
                  Ism
                </Label>
                <Input
                  autocomplete="off"
                  v-model:model-value="newClientToUpdate.firstname"
                  id="firstName"
                  class="py-6 text-lg"
                  :placeholder="fullnameSplitted.firstname"
                />
              </div>

              <div class="flex flex-col items-start">
                <Label for="lastName" class="text-right text-lg font-bold">
                  Familiya
                </Label>
                <Input
                  autocomplete="off"
                  v-model:model-value="newClientToUpdate.lastname"
                  id="lastName"
                  class="py-6 text-lg"
                  :placeholder="fullnameSplitted.lastname"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <MainButton
                  :disabled="buttonDisabled"
                  class="py-6 text-lg font-manrope"
                  @click="updatePersonalInfo"
                >
                  Saqlash
                </MainButton>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    <div v-show="!loading && !error" class="middle">
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
            {{ !client?.bonus ? "0" : client.bonus }} so'm
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
            {{ client?.promocode.code }}
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
    <div
      v-show="loading && !error"
      class="first-part h-[140px] border-b flex justify-between items-center w-full animate-pulse"
    >
      <div class="left flex items-center space-x-5 w-full">
        <div class="w-20 h-20 bg-gray-100 rounded-full"></div>
        <div class="info flex flex-col w-[50%] space-y-4">
          <div class="w-full rounded-full h-6 bg-gray-100"></div>
          <div class="w-[70%] rounded-full h-4 bg-gray-100"></div>
        </div>
      </div>
    </div>
    <div v-show="loading && !error" class="middle animate-pulse">
      <div class="bonus py-4 section flex justify-between items-center">
        <div class="left mr-5">
          <div
            class="title flex items-center mb-2 bg-gray-100 w-28 rounded-full h-4"
          ></div>
          <div class="flex flex-wrap gap-2 mt-4">
            <div class="bg-gray-100 w-20 rounded-full h-2"></div>
            <div class="bg-gray-100 w-32 rounded-full h-2"></div>
            <div class="bg-gray-100 w-28 rounded-full h-2"></div>
          </div>
        </div>
        <div class="right">
          <div class="w-24 h-10 bg-gray-100 rounded-full"></div>
        </div>
      </div>
      <div class="divider w-full h-5 bg-gray-100"></div>
      <div class="promocode py-4 section flex justify-between items-center">
        <div class="left mr-5">
          <div
            class="title flex items-center mb-2 bg-gray-100 w-28 rounded-full h-4"
          ></div>
          <div class="flex flex-wrap gap-2 mt-4">
            <div class="bg-gray-100 w-20 rounded-full h-2"></div>
            <div class="bg-gray-100 w-32 rounded-full h-2"></div>
            <div class="bg-gray-100 w-28 rounded-full h-2"></div>
          </div>
        </div>
        <div class="right">
          <div class="w-24 h-10 bg-gray-100 rounded-full"></div>
        </div>
      </div>
      <div class="divider w-full h-5 bg-gray-100"></div>
    </div>

    <div v-show="error" class="error text-center">
      <h1 class="title text-primary font-bold text-2xl mt-6">
        Xatolik yuzaga keldi
      </h1>
      <p class="desc text-primary mt-2">Boshqatdan urinib ko'ring</p>
      <MainButton
        @click="getAccount()"
        :disabled="loading || !error"
        class="font-semibold font-manrope my-4"
        ><RotateCcw
          class="w-4 h-4 mr-2"
          :class="[!loading && error ? '' : 'animate-spin']"
        />
        <p v-show="!loading && error">Boshqatdan</p>
        <p v-show="loading || !error">Yuklanmoqda...</p>
      </MainButton>
    </div>
  </div>
</template>
