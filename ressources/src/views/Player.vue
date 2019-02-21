<template>
  <div class="screen">
    <div class="video-and-settings">
      <div class="videocontainer">
        <video
          class="video-elm"
          :id="playerId"
          :src="link"
          width="100%"
          height="100%"
          maxwidth="100%"
          maxheight="100%"
        >
        </video>
        <Nico
          ref="nico"
          :enabled="nico"
          :fullscreen="fullscreen"
        />
      </div>
      <div class="tools">
        <vs-button
          v-if='iAmTheOwner'
          color="success"
          type="filled"
          @click="openPopup"
          class="action-button"
        >Changer la vidéo</vs-button>
        <router-link to="/rooms">
          <vs-button
            color="dark"
            type="filled"
            class="action-button"
          >Quitter la salle<span v-if='iAmTheOwner'> (la détruire)</span></vs-button>
        </router-link>

        <vs-popup
          title="Changer de vidéo"
          :active.sync="linkpopup"
        >
          <p>Entrez ici le lien vers la vidéo que vous souhaitez lire (YouTube, Dailymotion, Twitch, ou un lien direct vers une vidéo compatible) :
          </p>
          <vs-input
            icon="video_library"
            label-placeholder="Lien vers la ressource (vidéo ou musique)"
            v-model="newLink"
            class="link-input"
            size="large"
            autocomplete="url"
            @keydown.enter="changeLink($event)"
            autofocus
            ref="linkinput"
            :danger="!this.validLink"
            danger-text="Ce lien est invalide"
            val-icon-danger="error_outline"
          />
          <vs-button
            color="primary"
            type="filled"
            class="update-room"
            @click="changeLink($event)"
          >Modifier le lien</vs-button>

        </vs-popup>
      </div>
    </div>
    <Chat
      :roomId="id"
      class="chat"
    />
  </div>
</template>

<script>
import Vue from "vue";
import Nico from "@/components/Player/Nico.vue";
import Chat from "@/components/Player/Chat.vue";
import "../plugins/mediaelement.ts";
import { throttle } from "lodash-es";
export default Vue.extend({
  props: ["id"],
  components: {
    Nico,
    Chat
  },
  data() {
    return {
      player: "",
      playerElement: "",
      playerId: "video" + this.id,
      nico: true,
      fullscreen: false,
      linkpopup: false,
      newLink: "",
      regex: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.\:]{2,10})([\/\w \.-\?\-\&\%\_\=]*)*\/?$/
    };
  },
  computed: {
    link() {
      return this.$store.getters.videoLink(this.id);
    },
    roomOwner() {
      return this.$store.getters.roomOwner(this.id);
    },
    iAmTheOwner() {
      return this.roomOwner === this.$store.state.user;
    },
    validLink() {
      if (this.newLink !== "") {
        return this.regex.test(this.newLink);
      } else {
        return true;
      }
    }
  },
  sockets: {
    currentRoom(data) {
      if (!this.iAmTheOwner) {
        if (data.operation === "play") {
          this.player.play();
          this.player.currentTime = data.data.timecode;
        } else if (data.operation === "pause") {
          this.player.pause();
        } else if (data.operation === "sync") {
          if (this.player.paused) {
            this.player.play();
          }
          var newCode = data.data.timecode;
          var currentCode = this.player.currentTime;
          var timeDifference = newCode - currentCode;
          if (timeDifference >= 2 || timeDifference <= -2) {
            this.player.currentTime = newCode;
          }
        }
      }
    },
    rooms(data) {
      if (data.data.roomId === this.id && data.operation === "changeLink") {
        this.player.setSrc(data.data.link);
        this.player.play();
      }
    },
    reconnect(data) {
      $vs.notify({
        title: "Succès",
        text: "Reconnecté au serveur",
        color: "success",
        icon: "check_box"
      });
    },
    disconnect(data) {
      $vs.notify({
        title: "Erreur",
        text: "Impossible de joindre le serveur",
        color: "danger",
        icon: "error"
      });
    }
  },
  methods: {
    changeLink(event) {
      if (this.validLink && this.$data.newLink !== "") {
        this.$data.linkpopup = false;
        this.$socket.emit("currentRoom", {
          operation: "changeLink",
          data: {
            roomId: this.$props.id,
            link: this.$data.newLink
          }
        });
        this.$data.newLink = "";
      }
    },
    openPopup() {
      this.linkpopup = true;
      this.$refs.linkinput.$el.querySelector("input").focus();
    }
  },
  mounted() {
    if (this.link === undefined) {
      this.$router.push({ name: "rooms" });
    }
    this.$socket.emit("rooms", {
      operation: "connect",
      data: {
        id: this.id
      }
    });
    this.$store.commit("setRoom", this.id);
    mejs.i18n.language("fr");
    var component = this;
    this.player = new MediaElementPlayer(this.playerId, {
      success: function(mediaElement, node, instance) {
        mediaElement.addEventListener(
          "nico",
          () => (component.nico = !component.nico)
        );
        component.playerElement = mediaElement;
        instance.container.appendChild(component.$refs.nico.$el);
      },
      features: [
        "playpause",
        "current",
        "progress",
        "duration",
        "volume",
        "nico",
        "fullscreen"
      ],
      stretching: "responsive",
      enableAutosize: true
    });
    if (this.iAmTheOwner) {
      this.playerElement.addEventListener("playing", elm => {
        this.$socket.emit("currentRoom", {
          operation: "play",
          data: { timecode: this.$data.player.currentTime, roomId: this.id }
        });
      });

      this.playerElement.addEventListener("pause", elm => {
        this.$socket.emit("currentRoom", {
          operation: "pause",
          data: { timecode: this.$data.player.currentTime, roomId: this.id }
        });
      });

      this.playerElement.addEventListener(
        "timeupdate",
        throttle(
          function() {
            if (!this.player.paused) {
              this.$socket.emit("currentRoom", {
                operation: "sync",
                data: {
                  timecode: this.$data.player.currentTime,
                  roomId: this.id
                }
              });
            }
          }.bind(this),
          500
        )
      );
    }
  },
  updated() {
    if (this.link === undefined) {
      this.$router.push({ name: "rooms" });
    }
  },
  beforeDestroy() {
    this.player.pause();
    this.playerElement.remove();
    this.$store.commit("setRoom", null);
    if (this.iAmTheOwner) {
      this.$socket.emit("rooms", {
        operation: "remove",
        data: {
          id: this.id
        }
      });
    }
  },
  destroyed() {
    this.$socket.emit("rooms", {
      operation: "disconnect",
      data: {
        id: this.id
      }
    });
  }
});
</script>

<style lang="scss" scoped>
.videocontainer {
  position: relative;
  width: 100%;
  height: 100%;
}
.video-elm {
  width: 100%;
  height: 100%;
}
.link-input {
  margin-top: 2rem;
  width: 100%;
}
.update-room {
  margin: 1em auto;
  display: block;
}
.list-item {
  width: 100%;
}
.screen {
  display: flex;
  height: 100vh;
}
.video-and-settings {
  width: 70%;
  display: flex;
  flex-direction: column;
}
.chat {
  width: 30%;
}
.action-button {
  margin: 1em;
}
.tools {
  text-align: right;
}
</style>
