<template>
  <div class="chat">
    <div
      class="msg-container"
      ref="msgcontainer"
    >
      <p
        v-for="msg in messages"
        v-bind:style="{background: getColor(msg.username), marginTop: getMargin(msg)}"
        :key="msg.id"
      ><span class="username">{{ msg.username }} : </span>{{ msg.text }}</p>
    </div>
    <MsgInput
      :roomId="roomId"
      class="center chat-input"
    />
  </div>
</template>

<script>
import Vue from "vue";
import MsgInput from "@/components/Player/MsgInput.vue";
export default Vue.extend({
  props: ["roomId"],
  components: {
    MsgInput
  },
  computed: {
    messages() {
      let room = this.$store.state.rooms.find(
        elm => elm[0] === this.$store.state.currentRoom
      );
      if (room) {
        return room[1].messages;
      }
    }
  },
  methods: {
    getColor(username) {
      let color = this.$store.state.userColors.get(username);
      //let result =
      // "linear-gradient(to right, " +
      // color +
      // " 0%," +
      // color.replace(/(1\))/g, "0.8)") +
      // " 100%)";
      return color;
    },
    getMargin(message) {
      let index = this.messages.findIndex(elm => message === elm);
      let previousMessage = this.messages[index - 1];
      let currentMessage = this.messages[index];
      if (
        previousMessage &&
        previousMessage.username === currentMessage.username
      ) {
        return "-15px";
      } else {
        return "0.5em";
      }
    }
  },
  watch: {
    messages() {
      let msgcontainer = this.$refs.msgcontainer;
      if (msgcontainer) {
        let scroll = msgcontainer.scrollHeight;
        let interval = setInterval(() => {
          if (msgcontainer && scroll) {
            msgcontainer.scrollTop = scroll;
            if (scroll !== msgcontainer.scrollHeight) {
              clearInterval(interval);
            } else if (!msgcontainer || !scroll) {
              clearInterval(interval);
            }
          }
        }, 10);
      }
    }
  }
});
</script>

<style lang="scss" scoped>
.chat {
  position: relative;
  display: flex;
  flex-direction: column;
}
.chat-input {
  margin-bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  width: 85%;
}
.msg-container {
  padding: 0.4em;
  height: 100%;
  overflow: auto;

  p {
    border-radius: 5px;
    padding: 0.8em 2em;
    margin: 0.4em;
    .username {
      font-weight: bold;
    }
  }
}
</style>

