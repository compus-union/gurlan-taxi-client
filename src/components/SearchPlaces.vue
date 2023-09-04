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
  IonSkeletonText,
  IonThumbnail,
  modalController,
  IonList,
  IonText,
} from "@ionic/vue";
import { locationOutline, searchOutline } from "ionicons/icons";
import { useSearchPlaces } from "@/store/searchPlaces";
import { ref, toRefs } from "vue";
import { useLoading } from "@/store/loading";

const loadingStore = useLoading();
const searchPlacesStore = useSearchPlaces();
const typing = ref(false);

function createDebounce() {
  let timeout = ref<any>();
  return function (fnc: Function, delayMs: number) {
    typing.value = true;
    clearTimeout(timeout.value);
    timeout.value = setTimeout(() => {
      fnc();
      typing.value = false;
    }, delayMs || 500);
  };
}

const debounce = ref<Function>(createDebounce());

const placeName = ref();

const cancel = () => modalController.dismiss(null, "cancel");
const confirm = (coords: { lat: string | number; lon: string | number }) => {
  modalController.dismiss(coords, "confirm");
};

const loadingRef = toRefs(loadingStore);
</script>

<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button color="medium" @click="cancel">Bekor qilish</ion-button>
      </ion-buttons>
      <ion-title class="mr-4" slot="end">Qidirish</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-item class="mb-4">
      <ion-icon class="mr-4" :icon="searchOutline"></ion-icon>
      <ion-input
        label-placement="floating"
        label="Manzilingizni qidiring"
        v-model.trim.lazy="placeName"
        @ion-input="debounce(() => searchPlacesStore.searchPlaces(placeName))"
        placeholder="Masalan: Eski bozor"
        type="search"
      ></ion-input>
    </ion-item>
    <ion-list
      v-show="
        !typing && searchPlacesStore.places?.length && !loadingRef.loading.value
      "
      class="items"
    >
      <ion-item
        v-for="place in (searchPlacesStore.places as any)"
        :key="place.place_id"
        button
        @click="confirm({ lat: place.lat, lon: place.lon })"
      >
        <ion-icon class="mr-4" :icon="locationOutline"></ion-icon>
        <ion-label class="py-3">
          <h3 class="bigger-text">{{ place.name }}</h3>
          <p>
            {{ place.display_name }}
          </p>
        </ion-label>
      </ion-item>
    </ion-list>
    <ion-list v-show="typing || loadingRef.loading.value">
      <ion-item>
        <ion-thumbnail class="w-[24px] h-[24px] mr-4" slot="start">
          <ion-skeleton-text :animated="true"></ion-skeleton-text>
        </ion-thumbnail>
        <ion-label class="py-4">
          <h3>
            <ion-skeleton-text
              :animated="true"
              style="width: 80%"
            ></ion-skeleton-text>
          </h3>
          <p>
            <ion-skeleton-text
              :animated="true"
              style="width: 60%"
            ></ion-skeleton-text>
          </p>
          <p>
            <ion-skeleton-text
              :animated="true"
              style="width: 30%"
            ></ion-skeleton-text>
          </p>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-thumbnail class="w-[24px] h-[24px] mr-4" slot="start">
          <ion-skeleton-text :animated="true"></ion-skeleton-text>
        </ion-thumbnail>
        <ion-label class="py-4">
          <h3>
            <ion-skeleton-text
              :animated="true"
              style="width: 80%"
            ></ion-skeleton-text>
          </h3>
          <p>
            <ion-skeleton-text
              :animated="true"
              style="width: 60%"
            ></ion-skeleton-text>
          </p>
          <p>
            <ion-skeleton-text
              :animated="true"
              style="width: 30%"
            ></ion-skeleton-text>
          </p>
        </ion-label>
      </ion-item>
    </ion-list>
    <div class="not-found" v-show="searchPlacesStore.notFound">
      <ion-text class="text-center block mt-10"> Joy topilmadi. </ion-text>
    </div>
  </ion-content>
</template>

<style scoped>
.bigger-text {
  font-size: 20px;
}
</style>
