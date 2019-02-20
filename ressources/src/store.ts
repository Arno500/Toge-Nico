import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    rooms: Array(),
    connected: Boolean(false),
    user: String(),
    currentRoom: String,
    userColors: new Map([["Serveur", "rgb(237, 237, 237)"]])
  },
  getters: {
    videoLink: state => (id: String) => {
      let returnValue = state.rooms.find(elm => {
        if (elm[0] == id) {
          return true;
        } else {
          return false;
        }
      });
      if (returnValue) {
        return returnValue[1].video;
      }
    },
    roomOwner: state => (id: String) => {
      let returnValue = state.rooms.find(elm => {
        if (elm[0] == id) {
          return true;
        } else {
          return false;
        }
      });
      if (returnValue) {
        return returnValue[1].owner;
      }
    },
    getMessages: state => {
      let room = state.rooms.find(elm => elm[0] === state.currentRoom);
      if (room) {
        return room[1].messages;
      }
    }
  },
  mutations: {
    addRoom(state, user) {
      state.rooms = state.rooms.concat(user);
    },
    deleteRoom(state, id) {
      state.rooms = state.rooms.filter(elm => elm[0] !== id);
    },
    setRoom(state, id) {
      state.currentRoom = id;
    },
    setConnection(state, connecState) {
      state.connected = connecState;
    },
    setUser(state, username) {
      state.user = username;
    },
    setCurrentRoom(state, roomId) {
      state.currentRoom = roomId;
    },
    addMessage(state, message) {
      let room = state.rooms.find(elm => elm[0] === state.currentRoom);
      if (room) {
        if (message.type && message.type === "system") {
          message.username = "Serveur";
        }
        if (!state.userColors.has(message.username)) {
          state.userColors.set(
            message.username,
            "hsla(" + Math.random() * 360 + ", 100%, 50%, 1)"
          );
        }
        room[1].messages.push(message);
      }
    },
    setMessages(state, messages) {
      let room = state.rooms.find(elm => elm[0] === state.currentRoom);
      if (room) {
        room[1].messages = messages;

        messages.forEach((elm: any) => {
          if (!state.userColors.has(elm.username)) {
            state.userColors.set(
              elm.username,
              "hsla(" + Math.random() * 360 + ", 100%, 50%, 1)"
            );
          }
        });
      }
    },
    changeRoomLink(state, data) {
      let room = state.rooms.find(elm => elm[0] === data.roomId);
      if (room) {
        room[1].video = data.link;
      }
    }
  },
  actions: {
    socket_rooms({ commit }, status) {
      if (status.operation === "add") {
        commit("addRoom", [status.data]);
      }
      if (status.operation === "remove") {
        commit("deleteRoom", status.data.id);
      }
      if (status.operation === "changeLink") {
        commit("changeRoomLink", status.data);
      }
    },
    socket_currentRoom({ commit }, status) {
      if (status.operation === "text") {
        commit("addMessage", status.data);
      } else if (status.operation === "refreshMessages") {
        commit("setMessages", status.data.messages);
      } else if (status.operation === "changeLink") {
        commit("changeRoomLink", status.data.roomId, status.data.link);
      }
    },
    socket_disconnect() {
      window.location.reload();
    },
    getRooms({ commit }) {
      Vue.http
        .get(
          window.location.protocol + "//" + window.location.host + "/api/rooms"
        )
        .then((data: any) => commit("addRoom", data.body));
    },
    setupNewRoom({ state }, { roomLink }) {
      return Vue.http.put(
        window.location.protocol +
          "//" +
          window.location.host +
          "/api/rooms/add",
        {
          video: roomLink,
          userName: state.user
        }
      );
    }
  }
});
