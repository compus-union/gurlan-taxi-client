<script setup lang="ts">
import { vMaska } from "maska";
import { cn } from "../../lib/utils";
import { computed, defineAsyncComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../../store/auth";
import { ResponseStatus } from "@/constants";

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
const Checkbox = defineAsyncComponent(
  () => import("../../components/ui/checkbox/Checkbox.vue")
);

const router = useRouter();
const authStore = useAuth();

const showPassword = ref(false);
const loading = ref(false);

const handleShowPassword = (e: boolean) => {
  showPassword.value = e;
};

async function login() {

  const result = await authStore.login();

  if (
    result?.status === "nextStep" ||
    result?.status === ResponseStatus.CLIENT_READY_TO_REGISTER
  ) {
    router.push("/auth/register");
    return;
  }

  if (result?.status === ResponseStatus.BANNED) {
    router.push("/register");
    return;
  }

  if (result?.status === ResponseStatus.CLIENT_LOGIN_DONE) {
    router.push("/ride/setOrigin");
    return;
  }

  return;
}

const buttonDisabled = computed(() => {
  if (
    authStore.clientDetails.phone.length < 19 ||
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
      <CardTitle>Tizimga kirish</CardTitle>
      <CardDescription
        >Telefon raqam va parolingiz orqali tizimga kirishni amalga
        oshiring.</CardDescription
      >
    </CardHeader>
    <CardContent class="form">
      <div class="form-group mb-4">
        <Label for="phone"> Telefon raqam </Label>
        <Input
          data-maska="+998 (##) ### ## ##"
          v-maska
          placeholder="+998 (99) 999 99 99"
          id="phone"
          autofocus
          type="text"
          v-model.trim.lazy="authStore.clientDetails.phone"
        />
      </div>
      <div class="form-group">
        <Label for="password">Parol</Label>
        <input
          :class="
            cn(
              'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
            )
          "
          placeholder="******"
          id="password"
          v-model.trim.lazy="authStore.clientDetails.password"
          :type="showPassword === true ? 'text' : 'password'"
        />
      </div>
      <div class="form-group mt-4 flex items-center space-x-4">
        <Checkbox @update:checked="handleShowPassword" id="showPass" />
        <Label for="showPass">Parolni ko'rsatish</Label>
      </div>
      <div class="form-group mt-4 flex items-center space-x-4">
        <Button :disabled="buttonDisabled" @click="login" class="w-full"
          >Kirish</Button
        >
      </div>
    </CardContent>
  </Card>
</template>
