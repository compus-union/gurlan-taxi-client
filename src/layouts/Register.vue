<script setup lang="ts">
import { useAuth } from "@/store/auth";
import { vMaska } from "maska";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ResponseStatus } from "@/constants";

const router = useRouter();
const authStore = useAuth();

const showPassword = ref(false);
const nextStep = ref(false);
const loading = ref(false);

async function auth() {
  const result = await authStore.auth();

  if (result?.status === "nextStep") {
    nextStep.value = true;
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

  if (result?.status === ResponseStatus.CLIENT_READY_TO_REGISTER) {
    nextStep.value = true;
    return;
  }

  return;
}

async function register() {
  const result = await authStore.register();

  if (result?.status === ResponseStatus.CLIENT_REGISTER_DONE) {
    router.push({ path: "/ride/setOrigin" });

    return;
  }

  if (result?.status === ResponseStatus.BANNED) {
    router.push("/register");
    return;
  } 

  return;
}
</script>

<template>
  <div>
    hello
  </div>
</template>
