<template>
  <vs-list>
    <vs-list-header
      icon="meeting_room"
      title="Salles disponibles"
    ></vs-list-header>

    <Room
      v-for="room in rooms"
      :key="room[0]"
      :video="room[1].video"
      :ownerName="room[1].owner"
    />
  </vs-list>
</template>

<script>
import Vue from "vue";
import Room from "@/components/Rooms/Room.vue";
export default Vue.extend({
  components: {
    Room
  },
  computed: {
    rooms() {
      return this.$store.state.rooms;
    }
  }
});
</script>