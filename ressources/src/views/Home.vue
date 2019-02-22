<template>
  <vs-row
    vs-align="flex-start"
    vs-type="flex"
    vs-justify="center"
    vs-w="12"
  >
    <vs-col
      vs-type="flex"
      vs-justify="center"
      vs-align="center"
      vs-w="8"
    >
      <div>
        <p class="username-text">
          Choisissez votre nom d'utilisateur
        </p>

        <vs-input
          label-placeholder="Nom d'utilisateur"
          v-model.trim="userName"
          @keydown.enter="startTheGame"
          class="username-input"
          autofocus
          size="large"
        />
        <vs-button
          color="primary"
          type="filled"
          @click="startTheGame"
          class="button"
        >Confirmer</vs-button>
      </div>
    </vs-col>
  </vs-row>
</template>

<script>
import { Component, Vue } from "vue-property-decorator";
import router from "../router";

// import RoomList from "@/components/RoomList.vue"; // @ is an alias to /src

@Component({
  data() {
    return {
      userName: ""
    };
  },
  computed: {
    connected() {
      return this.$store.state.connected;
    }
  },
  watch: {
    connected() {
      if (this.connected === true) {
        router.replace(this.$route.query.redirect || "rooms");
      }
    }
  },
  methods: {
    startTheGame() {
      if (this.$data.userName !== "") {
        this.$store.dispatch("setUserName", this.$data.userName);
        router.replace(this.$route.query.redirect || "rooms");
      }
    }
  }
})
export default class Home extends Vue {}
</script>

<style lang="sass" scoped>
.username-text
  margin-top: 10rem
.username-input
  margin-top: 2rem
  width: 100%
.button
  display: block
  margin: 1em auto
</style>
