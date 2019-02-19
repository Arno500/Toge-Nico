<template>
  <vs-input
    icon="message"
    placeholder="Votre message..."
    v-model="msg"
    @keydown.enter="sendMsg"
    :danger="tooLong"
    danger-text="Le message est trop long !"
    val-icon-danger="error_outline"
    :descriptionText="msgLength"
    size="large"
  />
</template>

<script>
export default {
  props: ["roomId"],
  data() {
    return {
      msg: ""
    };
  },
  computed: {
    msgLength() {
      return this.msg.length + " / 100";
    },
    tooLong() {
      return this.msg.length > 100;
    }
  },
  methods: {
    sendMsg() {
      if (
        this.msg.length <= 100 &&
        this.msg !== "" &&
        !/^\s+$/gim.test(this.msg)
      ) {
        this.$socket.emit("currentRoom", {
          operation: "text",
          data: {
            text: this.msg,
            roomId: this.roomId
          }
        });
        this.msg = "";
      }
    }
  }
};
</script>
