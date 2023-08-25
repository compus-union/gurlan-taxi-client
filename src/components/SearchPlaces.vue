<script lang="ts" setup>
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonItem,
  IonInput,
  IonLabel,
  IonIcon,
  modalController,
} from "@ionic/vue";
import { locationOutline, searchOutline } from "ionicons/icons";
import {useSearchPlaces} from "@/store/searchPlaces"
import Loading from "./Loading.vue";
import { useLoading } from "@/store/loading";
import { onMounted, ref } from "vue";


const searchPlacesStore = useSearchPlaces()
const loadingStore = useLoading();

const placeName = ref();

const cancel = () => modalController.dismiss(null, "cancel");
const confirm = () => modalController.dismiss(placeName.value, "confirm");
</script>

<template>
  <ion-header>
    <Loading />
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button color="medium" @click="cancel">Bekor qilish</ion-button>
      </ion-buttons>
      <ion-title>Qidirish</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-item class="mb-4">
      <ion-icon class="mr-4" :icon="searchOutline"></ion-icon>
      <ion-input
        label-placement="floating"
        label="Manzilingizni qidiring"
        v-model="placeName"
        @ion-input="searchPlacesStore.searchPlaces(placeName)"
        placeholder="Masalan: Eski bozor"
      ></ion-input>
    </ion-item>
    <div class="items">
      <ion-item button>
        <ion-icon class="mr-4" :icon="locationOutline"></ion-icon>
        <ion-label class="py-3">
          <h3 class="bigger-text">Dehqon bozor</h3>
          <p>
            Dehqon bozor, Mustaqillik ko‘ch., Gurlan, Gurlan Tumani, Xorazm
            Viloyati, Oʻzbekiston
          </p>
        </ion-label>
      </ion-item>
      <ion-item button>
        <ion-icon class="mr-4" :icon="locationOutline"></ion-icon>
        <ion-label class="py-3">
          <h3 class="bigger-text">Dehqon bozor</h3>
          <p>
            Dehqon bozor, Mustaqillik ko‘ch., Gurlan, Gurlan Tumani, Xorazm
            Viloyati, Oʻzbekiston
          </p>
        </ion-label>
      </ion-item>
      <ion-item button>
        <ion-icon class="mr-4" :icon="locationOutline"></ion-icon>
        <ion-label class="py-3">
          <h3 class="bigger-text">Dehqon bozor</h3>
          <p>
            Dehqon bozor, Mustaqillik ko‘ch., Gurlan, Gurlan Tumani, Xorazm
            Viloyati, Oʻzbekiston
          </p>
        </ion-label>
      </ion-item>
    </div>
  </ion-content>
</template>

<style scoped>
.bigger-text {
    font-size: 20px;
}
</style>