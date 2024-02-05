<script setup lang="ts"></script>

<template>
  <div
    class="skeleton-loading mb-8 space-x-4 my-4 flex items-center justify-between w-full h-[40px]"
  >
    <div class="icon-part h-full w-[16%] flex items-center justify-center">
      <div class="bg-gray-100 w-full h-full animate-pulse"></div>
    </div>
    <div class="text-part h-full w-full">
      <div class="h-4 mb-2 w-[50%] bg-gray-100 animate-pulse"></div>
      <div class="h-2 mb-2 w-full bg-gray-100 animate-pulse"></div>
      <div class="h-2 w-full bg-gray-100 animate-pulse"></div>
    </div>
  </div>
</template>
