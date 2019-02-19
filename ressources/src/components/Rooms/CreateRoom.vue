<template>
  <div>
    <vs-row
      vs-align="flex-start"
      vs-type="flex"
      vs-justify="center"
      vs-w="12"
      class="createroom"
    >
      <vs-col
        vs-type="flex"
        vs-justify="center"
        vs-align="center"
        vs-w="8"
      >
        <vs-button
          @click="openPopup"
          color="primary"
          type="filled"
        >Créer une salle</vs-button>
      </vs-col>
    </vs-row>
    <vs-popup
      title="Créer une salle"
      :active.sync="popup"
    >
      <p>Entrez ici le lien vers la vidéo que vous souhaitez lire (YouTube, Dailymotion, Twitch, ou un lien direct vers une vidéo compatible) :
      </p>
      <vs-input
        icon="video_library"
        label-placeholder="Lien vers la ressource (vidéo ou musique)"
        v-model="link"
        class="link-input"
        size="large"
        autocomplete="url"
        @keydown.enter="createRoom($event)"
        autofocus
        ref="linkinput"
        :danger="!this.validLink"
        danger-text="Ce lien est invalide"
        val-icon-danger="error_outline"
      />
      <vs-button
        color="primary"
        type="filled"
        @click="createRoom($event)"
        class="create-room"
      >Créer la salle</vs-button>

    </vs-popup>
  </div>
</template>
  
<script>
import Vue from "vue";
export default Vue.extend({
  data() {
    return {
      popup: false,
      link: "",
      regex: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.\:]{2,10})([\/\w \.-\?\-\&\%\_\=]*)*\/?$/
    };
  },
  computed: {
    validLink() {
      if (this.link !== "") {
        return this.regex.test(this.link);
      } else {
        return true;
      }
    }
  },
  methods: {
    createRoom(event) {
      if (this.validLink && this.$data.link !== "") {
        this.$data.popup = false;
        this.$store
          .dispatch("setupNewRoom", {
            roomLink: this.$data.link
          })
          .then(data => {
            this.$router.push({
              name: "player",
              params: { id: data.bodyText }
            });
          });
      } else {
        return;
      }
    },
    openPopup() {
      this.popup = true;
      this.$refs.linkinput.$el.querySelector("input").focus();
    }
  }
});
</script>

<style lang="sass" scoped>
.link-input
    margin-top: 2rem
    width: 100%
.list-item 
    width: 100%
.create-room
    margin: 1em auto
    display: block
</style>
