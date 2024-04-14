<template>
  <div class="single">
    <em></em>
  </div>
</template>

<style scoped>
.single em {
  width: 20px;
  height: 20px;
  margin: 90 auto;
  background: black;
  cursor: pointer;
  display: block;
  position: relative;
  -moz-border-radius: 45px;
  -webkit-border-radius: 45px;
  border-radius: 45px;
}
.single em:after {
  content: "";
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  box-shadow: 0 0 1px 2px rgba(0, 0, 0, 0.8);
  top: 50%;
  left: 50%;
  margin-top: -60px;
  margin-left: -60px;
  z-index: 3;
  opacity: 0;
  -webkit-animation: halo 1s 0.5s infinite ease-out;
  -moz-animation: halo 1s 0.5s infinite ease-out;
  animation: halo 1s 0.5s infinite ease-out;
}
.single em:before {
  content: "";
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  box-shadow: 0 0 1px 2px rgba(0, 0, 0, 0.8);
  top: 50%;
  left: 50%;
  margin-top: -60px;
  margin-left: -60px;
  z-index: 3;
  opacity: 0;
  -webkit-animation: halo 1s 0.5s infinite ease-out;
  -moz-animation: halo 1s 0.5s infinite ease-out;
  animation: halo 1s 1s infinite ease-out;
}
@-webkit-keyframes halo {
  0% {
    opacity: 0;
    -webkit-transform: scale(0.1);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    -webkit-transform: scale(1.2);
  }
}
@-moz-keyframes halo {
  0% {
    opacity: 0;
    -moz-transform: scale(0.1);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    -moz-transform: scale(1.2);
  }
}
@-ms-keyframes halo {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
@-o-keyframes halo {
  0% {
    opacity: 0;
    -o-transform: scale(0.1);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    -o-transform: scale(1.2);
  }
}
@keyframes halo {
  0% {
    opacity: 0;
    transform: scale(0.1);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: scale(1.2);
  }
}
</style>
