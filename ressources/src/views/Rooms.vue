<template>
  <div>
    <RoomList />
    <CreateRoom />
  </div>
</template>

<script>
import { Component, Vue } from "vue-property-decorator";
import RoomList from "@/components/Rooms/RoomList.vue";
import CreateRoom from "@/components/Rooms/CreateRoom.vue";

@Component({
  components: {
    CreateRoom,
    RoomList
  }
})
export default class Rooms extends Vue {}
</script>

<style scoped>
.createroom {
  margin-bottom: 2rem;
}
</style>

