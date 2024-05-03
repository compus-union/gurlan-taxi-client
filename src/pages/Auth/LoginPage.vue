<script setup lang="ts">
import { vMaska } from "maska";
import { cn } from "../../lib/utils";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../../store/auth";
import { ResponseStatus } from "@/constants";

import Card from "../../components/ui/card/Card.vue";
import CardContent from "../../components/ui/card/CardContent.vue";
import CardDescription from "../../components/ui/card/CardDescription.vue";
import CardHeader from "../../components/ui/card/CardHeader.vue";
import CardTitle from "../../components/ui/card/CardTitle.vue";
import Label from "../../components/ui/label/Label.vue";
import Input from "../../components/ui/input/Input.vue";
import Button from "../../components/ui/button/Button.vue";
import Checkbox from "../../components/ui/checkbox/Checkbox.vue";

const router = useRouter();
const authStore = useAuth();

const showPassword = ref(false);

const handleShowPassword = (e: boolean) => {
  showPassword.value = e;
};

async function login() {
  const result = await authStore.login();

  if (result?.status === ResponseStatus.CONFIRMATION_CODE_SENT) {
    await router.push({ path: "/auth/confirmation" });
    return;
  }

  if (result?.status === ResponseStatus.CLIENT_LOGIN_DONE) {
    console.log("Redirecting to the page");
    await router.push({ path: "/ride/setOrigin" });
    return;
  }

  return;
}

const buttonDisabled = computed(() => {
  if (
    authStore.clientDetails.phone.length < 12 ||
    authStore.clientDetails.password.length < 8
  ) {
    return true;
  } else {
    return false;
  }
});
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle class="text-lg font-bold">Tizimga kirish</CardTitle>
      <CardDescription class="text-base"
        >Telefon raqam va parolingiz orqali tizimga kirishni amalga
        oshiring.</CardDescription
      >
    </CardHeader>
    <CardContent class="form">
      <div class="form-group mb-4">
        <Label for="phone" class="text-lg"> Telefon raqam </Label>
        <Input
          data-maska="998#########"
          v-maska
          placeholder="998999447613"
          id="phone"
          autofocus
          type="text"
          class="py-6 text-lg"
          v-model.trim="authStore.clientDetails.phone"
        />
      </div>
      <div class="form-group">
        <Label for="password" class="text-lg">Parol</Label>
        <Input
          class="py-6 text-lg"
          placeholder="******"
          id="password"
          v-model.trim="authStore.clientDetails.password"
          :type="showPassword === true ? 'text' : 'password'"
        />
      </div>
      <div class="form-group mt-4 flex items-center space-x-4">
        <Checkbox @update:checked="handleShowPassword" id="showPass" />
        <Label for="showPass" class="text-lg">Parolni ko'rsatish</Label>
      </div>
      <div class="form-group mt-4 flex items-center space-x-4">
        <Button :disabled="buttonDisabled" @click="login" class="w-full text-lg py-6"
          >Kirish</Button
        >
      </div>
    </CardContent>
  </Card>
</template>
