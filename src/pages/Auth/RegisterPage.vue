<script setup lang="ts">
import { cn } from "../../lib/utils";
import { defineAsyncComponent } from "vue";
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

const router = useRouter();
const authStore = useAuth();

async function register() {
  const result = await authStore.register();

  if (result?.status === ResponseStatus.CONFIRMATION_CODE_SENT) {
    await router.push({ path: "/auth/confirmation" });

    return;
  }

  if (result?.status === ResponseStatus.BANNED) {
    await router.push("/auth/register");
    return;
  }

  return;
}
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Ro'yxatdan o'tish</CardTitle>
      <CardDescription
        >Ism familiya va email faqat lotin harflaridan tashkil topishi
        lozim.</CardDescription
      >
    </CardHeader>
    <CardContent class="form">
      <div class="form-group mb-4">
        <Label for="firstname"> Ism </Label>
        <Input
          placeholder="Sardor"
          id="firstname"
          autofocus
          type="text"
          v-model="authStore.clientDetails.firstname"
        />
      </div>
      <div class="form-group">
        <Label for="lastname">Familiya</Label>
        <input
          :class="
            cn(
              'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
            )
          "
          placeholder="Aminov"
          id="lastname"
          v-model="authStore.clientDetails.lastname"
          type="text"
        />
      </div>
      <div class="form-group mt-4">
        <Label for="email">Email</Label>
        <input
          :class="
            cn(
              'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
            )
          "
          placeholder="sardor@gmail.com"
          id="email"
          v-model="authStore.clientDetails.email"
          type="text"
        />
      </div>

      <div class="form-group mt-4 flex items-center space-x-4">
        <Button @click="register" class="w-full"
          >Jo'natish</Button
        >
      </div>
    </CardContent>
  </Card>
</template>
