<template>
  <div class="nico-container">
    <p
      class="text"
      v-for="text in texts"
      :key="text.id"
      v-bind:style="getComputedStyle(text.id)"
    >{{ text.text }}</p>
  </div>
</template>

<script>
import Vue from "vue";
export default Vue.extend({
  props: ["enabled"],
  data() {
    return {
      texts: [],
      cssCache: { top: {}, opacity: {} }
    };
  },
  sockets: {
    currentRoom(data) {
      if (
        data.operation === "text" &&
        !(data.data.type && data.data.type === "system")
      ) {
        this.texts.push(data.data);
        let timeout = setTimeout(() => {
          this.texts = this.texts.filter(elm => elm.id !== data.data.id);
          clearTimeout(timeout);
        }, 7000);
      }
    }
  },
  methods: {
    getComputedStyle(id) {
      let top =
        this.cssCache.top[id] ||
        (this.cssCache.top[id] = Math.random() * 90 + "%");
      const opacity = this.enabled
        ? this.cssCache.opacity[id] ||
          (this.cssCache.opacity[id] = Math.random() * (0.9 - 0.5) + 0.5)
        : 0;

      return {
        top,
        opacity
      };
    }
  }
});
</script>

<style lang="scss" scoped>
.nico-container {
  height: 100%;
  position: absolute;
  margin: 0 auto;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
  overflow: hidden;
}
p {
  position: absolute;
  color: white;
  left: 0;
  z-index: 999999;
  white-space: nowrap;
  animation: rightToLeft 5s linear;
  animation-fill-mode: forwards;
  font-size: 4rem;
  text-shadow: 4px 3px 0 #7a7a7a;
  -webkit-backface-visibility: hidden;
  -webkit-perspective: 1000;
}

@keyframes rightToLeft {
  from {
    transform: translate3d(105vw, 0, 0);
  }
  to {
    transform: translate3d(-110%, 0, 0);
  }
}
</style>

