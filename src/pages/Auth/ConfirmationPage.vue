<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useAuth } from "@/store/auth";
import { ResponseStatus } from "@/constants";
import { useRouter } from "vue-router";

const authStore = useAuth();
const router = useRouter();

const Card = defineAsyncComponent(
  () => import("../../components/ui/card/Card.vue")
);
const CardContent = defineAsyncComponent(
  () => import("../../components/ui/card/CardContent.vue")
);
const CardDescription = defineAsyncComponent(
  () => import("../../components/ui/card/CardDescription.vue")
);
const CardHeader = defineAsyncComponent(
  () => import("../../components/ui/card/CardHeader.vue")
);
const CardTitle = defineAsyncComponent(
  () => import("../../components/ui/card/CardTitle.vue")
);
const Label = defineAsyncComponent(
  () => import("../../components/ui/label/Label.vue")
);
const Input = defineAsyncComponent(
  () => import("../../components/ui/input/Input.vue")
);
const Button = defineAsyncComponent(
  () => import("../../components/ui/button/Button.vue")
);

async function confirm() {
  const result = await authStore.confirmAccount();

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
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Tasdiqlash</CardTitle>
      <CardDescription
        >Emailingizga tasdiqlash kodi yuborildi. Shu orqali tizimga kirishni
        yakunlang.</CardDescription
      >
    </CardHeader>
    <CardContent class="form">
      <div class="form-group mb-4">
        <Label for="confirmationCode"> Tasdiqlash kodi </Label>
        <Input
          placeholder="XXXXXX"
          id="confirmationCode"
          autofocus
          type="text"
          v-model.trim.lazy="authStore.clientDetails.confirmationCode"
        />
      </div>

      <div class="form-group mt-4 flex items-center space-x-4">
        <Button :disabled="buttonDisabled" @click="confirm" class="w-full"
          >Jo'natish</Button
        >
      </div>
    </CardContent>
  </Card>
</template>
