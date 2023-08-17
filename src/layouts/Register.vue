<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonButton,
  IonCheckbox,
  IonText,
  loadingController,
} from "@ionic/vue";
import { vMaska } from "maska";
import { ref } from "vue";

const showPassword = ref(false);
const nextStep = ref(false);
const loading = ref(false);

const showLoading = async () => {
  loading.value = true;

  const loadingComponent = await loadingController.create({
    message: "Yuklanmoqda...",
    animated: true,
    duration: 3000,
  });

  loadingComponent.present();
};

const handleForm = async () => {
  loading.value = true;
  
  await showLoading();

  setTimeout(() => {
    nextStep.value = true;
    
    loading.value = false;
  }, 3000);
};
</script>

<template>
  <IonPage>
    <IonContent class="register-content font-bricolage">
      <div
        class="register-component h-[100dvh] flex flex-col items-center justify-center"
      >
        <h1 class="text-3xl my-4">
          Gurlan <span class="marked text-brand">taxi</span>
        </h1>
        <form
          @submit.prevent="handleForm"
          v-if="!nextStep && !loading"
          class="component-form border p-4 rounded shadow w-[90%] space-y-4 flex flex-col"
        >
          <div class="form-group">
            <label for="phone">Telefon raqamingiz</label>
            <input
              required
              id="phone"
              v-maska
              data-maska="+998 ## ### ## ##"
              type="text"
              autofocus
              class="phone-number px-2 py-1 rounded outline-none bg-transparent border w-full"
            />
          </div>
          <div class="form-group">
            <label for="password">Parolingiz</label>
            <input
              required
              id="password"
              :type="showPassword ? 'text' : 'password'"
              class="password px-2 py-1 rounded outline-none bg-transparent border w-full"
            />
          </div>
          <IonCheckbox
            v-model="showPassword"
            label-placement="end"
            class="self-start"
            >Parolni ko'rsatish</IonCheckbox
          >
          <IonButton type="submit" class="text-white font-bold font-roboto">
            DAVOM ETISH
          </IonButton>
        </form>
        <form
          v-else-if="nextStep && !loading"
          class="component-form border p-4 rounded shadow w-[90%] space-y-4 flex flex-col"
        >
          <div class="form-group">
            <label for="firstname">Ismingiz</label>
            <input
              id="firstname"
              type="text"
              autofocus
              class="firstname px-2 py-1 rounded outline-none bg-transparent border w-full"
            />
          </div>
          <div class="form-group">
            <label for="lastname">Familiyangiz</label>
            <input
              id="lastname"
              type="text"
              class="lastname px-2 py-1 rounded outline-none bg-transparent border w-full"
            />
          </div>
          <IonButton class="text-white font-bold font-roboto">
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
