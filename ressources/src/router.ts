import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
      meta: {
        title: "TogeNico"
      }
    },
    {
      path: "/rooms",
      name: "rooms",
      component: () =>
        import(/* webpackChunkName: "rooms" */ "./views/Rooms.vue"),
      meta: {
        title: "Liste des salles - TogeNico"
      }
    },
    {
      path: "/room/:id",
      name: "player",
      props: true,
      component: () =>
        import(/* webpackChunkName: "player" */ "./views/Player.vue"),
      meta: {
        title: "Lecteur - TogeNico"
      }
    },
    {
      path: "*",
      name: "not-found",
      redirect: "rooms"
    }
  ]
});
