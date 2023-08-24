import { defineStore } from "pinia";
import { Loader } from "@googlemaps/js-api-loader";
import config from "@/config";
import { useCoords } from "./coords";
import { ref } from "vue";

const loader = new Loader({
  apiKey: config.GOOGLE_MAPS_API_KEY,
  version: "weekly",
  language: "uz",
  region: "UZ",
});

export const useMaps = defineStore("maps-store", () => {
  const sharedMap = ref<google.maps.Map>();
  const coordsStore = useCoords();
  const markers = ref([]);

  async function setMap(payload: google.maps.Map) {
    sharedMap.value = payload;
    return;
  }

  async function getMarker(title: string) {
    const foundMarker = markers.value?.find((marker: google.maps.Marker) => {
      return marker.getTitle() === title;
    });

    return foundMarker as unknown as google.maps.Marker;
  }

  async function loadMap(id: string) {
    await coordsStore.getCoords();

    const { Map } = (await loader.importLibrary(
      "maps"
    )) as google.maps.MapsLibrary;

    sharedMap.value = new Map(document.getElementById(id) as HTMLElement, {
      center: { lat: coordsStore.coords.lat, lng: coordsStore.coords.lng },
      zoom: 20,
      mapTypeId: "OSM",
      mapTypeControl: false,
      streetViewControl: false,
      disableDefaultUI: true,
      rotateControl: true,
    });

    sharedMap.value.mapTypes.set(
      "OSM",
      new google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {
          let tilesPerGlobe = 1 << zoom;
          let x = coord.x % tilesPerGlobe;
          if (x < 0) {
            x = tilesPerGlobe + x;
          }

          return (
            "https://tile.openstreetmap.org/" +
            zoom +
            "/" +
            x +
            "/" +
            coord.y +
            ".png"
          );
        },
        tileSize: new google.maps.Size(256, 256),
        name: "OpenStreetMap",
        maxZoom: 18,
      })
    );

    const newMarker = new google.maps.Marker({
      map: sharedMap.value,
      position: sharedMap.value?.getCenter(),
      title: "origin-marker",
    });

    sharedMap.value.addListener("drag", () => {
      newMarker.setPosition(sharedMap.value?.getCenter());
    });

    sharedMap.value.addListener("dragend", async () => {
      const lat = sharedMap.value?.getCenter()?.lat() as number;
      const lng = sharedMap.value?.getCenter()?.lng() as number;

      await coordsStore.changeCoords({ lat, lng });
    });

    markers.value?.push(newMarker as unknown as never);

    return {
      Map,
      sharedMap,
    };
  }

  return {
    loadMap,
    setMap,
    sharedMap,
    markers,
    getMarker,
  };
});
