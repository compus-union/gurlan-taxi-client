<script setup lang="ts">
import { Preferences } from "@capacitor/preferences";
import { useAuth } from "@/store/auth";
import {
  IonPage,
  IonContent,
  IonButton,
  IonCheckbox,
  IonText,
} from "@ionic/vue";
import { vMaska } from "maska";
import { onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const authStore = useAuth();

const showPassword = ref(false);
const nextStep = ref(false);
const loading = ref(false);
const passwordIsIncorrect = ref(false);

onBeforeMount(async () => {
  const { value: auth_token } = await Preferences.get({ key: "auth_token" });
  const { value: clientOneId } = await Preferences.get({ key: "clientOneId" });

  if (!auth_token && !clientOneId) {
    return;
  }

  router.push("/ride");
});

async function auth() {
  const result = await authStore.auth();

  if (result?.status === "nextStep") {
    nextStep.value = true;
    return;
  }

  if (result?.status === "account-login") {
    router.push("/ride");

    return;
  }

  if (result?.status === "incorrect-password") {
    passwordIsIncorrect.value = true;
    return;
  }

  return;
}

async function register() {
  const result = await authStore.register();

  if (result?.status === "ok") {
    router.push({ path: "/ride" });

    return;
  }
}
</script>

<template>
  <IonPage>
    <IonContent class="register-content font-bricolage">
      <div
        class="register-component h-screen flex flex-col items-center justify-center"
      >
        <h1 class="text-3xl my-4">
          Gurlan <span class="marked text-brand">taxi</span>
        </h1>
        <form
          @submit.prevent="auth"
          v-if="!nextStep"
          class="component-form border p-4 rounded shadow w-[90%] space-y-4 flex flex-col"
        >
          <div class="form-group">
            <label for="phone">Telefon raqamingiz</label>
            <input
              :disabled="loading"
              required
              id="phone"
              v-maska
              data-maska="+998 ## ### ## ##"
              type="text"
              v-model="authStore.clientDetails.phone"
              autofocus
              class="phone-number px-2 py-1 rounded outline-none bg-transparent border w-full"
            />
          </div>
          <div class="form-group">
            <label for="password">Parolingiz</label>
            <input
              :disabled="loading"
              required
              v-model="authStore.clientDetails.password"
              id="password"
              :type="showPassword ? 'text' : 'password'"
              class="password px-2 py-1 rounded outline-none bg-transparent border w-full"
              :class="passwordIsIncorrect ? 'border-red-500' : ''"
            />
          </div>
          <IonCheckbox
            v-model="showPassword"
            label-placement="end"
            class="self-start"
            :disabled="loading"
            >Parolni ko'rsatish</IonCheckbox
          >
          <IonButton
            :disabled="loading"
            type="submit"
            class="text-white font-bold font-roboto"
          >
            DAVOM ETISH
          </IonButton>
        </form>
        <form
          @submit.prevent="register"
          v-else-if="nextStep"
          class="component-form border p-4 rounded shadow w-[90%] space-y-4 flex flex-col"
        >
          <div class="form-group">
            <label for="firstname">Ismingiz</label>
            <input
              :disabled="loading"
              id="firstname"
              v-model="authStore.clientDetails.firstname"
              type="text"
              autofocus
              class="firstname px-2 py-1 rounded outline-none bg-transparent border w-full"
            />
          </div>
          <div class="form-group">
            <label for="lastname">Familiyangiz</label>
            <input
              :disabled="loading"
              id="lastname"
              type="text"
              v-model="authStore.clientDetails.lastname"
              class="lastname px-2 py-1 rounded outline-none bg-transparent border w-full"
            />
          </div>
          <IonButton
            type="submit"
            :disabled="loading"
            class="text-white font-bold font-roboto"
          >
            KIRISH
          </IonButton>
        </form>
        <footer class="component-footer text-center w-[90%] mt-4">
          <IonText>
            Tizimga kirish orqali dasturdan foydalanish shartlariga rozilik
            bildirgan bo'lasiz.
          </IonText>
        </footer>
      </div>
    </IonContent>
  </IonPage>
</template>
