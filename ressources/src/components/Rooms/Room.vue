<template>
  <vs-row
    vs-align="flex-start"
    vs-type="flex"
    vs-justify="center"
    vs-w="12"
    @click.native="goToRoom($event)"
  >
    <vs-col
      vs-type="flex"
      vs-justify="flex-start"
      vs-align="flex-start"
      vs-w="8"
    >
      <vs-list-item
        :title="ownerName"
        :subtitle="subtitle"
        class="list-item"
      >
        <template slot="avatar">
          <vs-avatar :text="ownerName" />
        </template>
      </vs-list-item>
    </vs-col>
  </vs-row>
</template>

<script>
import Vue from "vue";
export default Vue.extend({
  props: {
    video: String,
    ownerName: String
  },
  computed: {
    subtitle() {
      return "Vidéo : " + this.video + ". Propriétaire : " + this.ownerName;
    }
  },
  methods: {
    goToRoom(event) {
      this.$router.push({
        name: "player",
        params: { id: this.$vnode.data.key }
      });
    }
  }
});
</script>

<style scoped>
.list-item {
  width: 100%;
  transition: all 0.2s;
  cursor: pointer;
}
.list-item:hover {
  box-shadow: 0px 24px 39px -19px #5f86d9a9;
}
</style>
