<script setup lang="ts">
import { useAuth } from "@/store/auth";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ResponseStatus } from "@/constants";

const router = useRouter();
const authStore = useAuth();

const showPassword = ref(false);

async function register() {
  const result = await authStore.register();

  if (result?.status === ResponseStatus.CLIENT_REGISTER_DONE) {
    await router.push({ path: "/ride/setOrigin" });

    return;
  }

  if (result?.status === ResponseStatus.BANNED) {
    await router.push("/register");
    return;
  }

  return;
}

const handle = (e: boolean) => {
  showPassword.value = e;
  console.log(showPassword.value);
};
</script>

<template>
  <div
    class="auth-page bg-background text-foreground h-screen flex items-center justify-center container mx-auto px-2"
  >
    <RouterView></RouterView>
  </div>
</template>
