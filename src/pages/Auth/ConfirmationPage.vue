<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useAuth } from "@/store/auth";
import { ResponseStatus } from "@/constants";
import { useRouter } from "vue-router";
import Card from "../../components/ui/card/Card.vue";
import CardContent from "../../components/ui/card/CardContent.vue";
import CardDescription from "../../components/ui/card/CardDescription.vue";
import CardHeader from "../../components/ui/card/CardHeader.vue";
import CardTitle from "../../components/ui/card/CardTitle.vue";
import Label from "../../components/ui/label/Label.vue";
import Input from "../../components/ui/input/Input.vue";
import Button from "../../components/ui/button/Button.vue";
import { Preferences } from "@capacitor/preferences";
import { vMaska } from "maska";
import { loadingController } from "@ionic/vue";
import { toast } from "vue-sonner";

const authStore = useAuth();
const router = useRouter();

const didMistake = ref(false);
const sendCodeAgainBtnDisabled = ref(true);
const sendCodeAgainBtnClicked = ref(false);
const interval = ref(60);

onMounted(async () => {
  const intervalId = setInterval(() => {
    interval.value -= 1;
    if (interval.value === 0) {
      clearInterval(intervalId);
    }
  }, 1000);
  setTimeout(() => {
    sendCodeAgainBtnDisabled.value = false;
  }, 60000);
});

watch(
  () => sendCodeAgainBtnClicked.value,
  (newState, oldState) => {
    if (newState === true) {
      sendCodeAgainBtnDisabled.value = true;
      interval.value = 60;
      const intervalId = setInterval(() => {
        interval.value -= 1;
        if (interval.value === 0) {
          clearInterval(intervalId);
        }
      }, 1000);
      setTimeout(() => {
        sendCodeAgainBtnDisabled.value = false;
      }, 60000);
    }
  }
);

async function confirm() {
  const result = await authStore.confirmAccount();

  if (result?.status === ResponseStatus.AUTH_WARNING) {
    didMistake.value = true;
    return;
  }

  if (
    result?.status === ResponseStatus.CLIENT_NOT_FOUND ||
    result?.status === ResponseStatus.BANNED
  ) {
    await router.push({ path: "/auth/login" });

    return;
  }

  if (result?.status === ResponseStatus.CONFIRMATION_DONE) {
    await router.push({ path: "/ride/setOrigin" });
    return;
  }

  return;
}

const buttonDisabled = computed(() => {
  const pattern = /^[0-9]+$/;

  if (
    authStore.clientDetails.confirmationCode.length === 6 &&
    pattern.test(authStore.clientDetails.confirmationCode)
  ) {
    return false;
  } else {
    return true;
  }
});

async function resetLogin() {
  const loading = await loadingController.create({ message: "Yuklanmoqda..." });
  try {
    await loading.present();

    await Preferences.clear();
    await router.push({ path: "/auth/login" });
    toast.info("Boshqatdan ro'yxatdan o'tishingiz mumkin", {duration: 4000});
  } catch (error) {
    alert(error);
  } finally {
    await loading.dismiss();
  }
}

async function sendConfirmationCodeAgain() {
  sendCodeAgainBtnClicked.value = true;
  try {
    const result = await authStore.sendConfirmationCodeAgain();

    if (!result) {
      throw new Error("Nimadir xato ketdi, boshqatdan urinib ko'ring");
    }

    if (result.status === ResponseStatus.CONFIRMATION_DONE) {
      await router.push({ path: "/ride/setOrigin" });
      return;
    }

    return;
  } catch (error: any) {
    alert(
      error.message ||
        error ||
        "Qandaydir xatolik yuzaga keldi, boshqatdan urinib ko'ring"
    );
  }
}
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Tasdiqlash</CardTitle>
      <CardDescription
        >Telefon raqamingizga tasdiqlash kodi yuborildi. Shu orqali tizimga
        kirishni yakunlang.</CardDescription
      >
    </CardHeader>
    <CardContent class="form">
      <div class="form-group mb-4">
        <Label for="confirmationCode"> Tasdiqlash kodi </Label>
        <Input
          v-maska
          data-maska="######"
          placeholder="XXXXXX"
          id="confirmationCode"
          autofocus
          type="text"
          v-model.trim="authStore.clientDetails.confirmationCode"
        />
      </div>

      <div class="form-group mt-4 flex flex-col items-center space-y-2">
        <Button :disabled="buttonDisabled" @click="confirm" class="w-full"
          >Jo'natish</Button
        >
        <Button
          :disabled="sendCodeAgainBtnDisabled"
          class="w-full"
          variant="secondary"
          @click="sendConfirmationCodeAgain"
          >Kodni boshqatdan olish</Button
        >
        <span class="text-sm mt-3 w-full text-center"
          >Kodni {{ interval }} soniyadan keyin qayta olishingiz mumkin</span
        >
      </div>
    </CardContent>
  </Card>

  <Button @click="resetLogin" class="mt-3" variant="ghost"
    >Boshqatdan ro'yxatdan o'tish</Button
  >
</template>
