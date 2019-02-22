import Vue from 'vue';
import './plugins/vuesax';
import './assets/style.css';
import App from './App.vue';
import router from './router';
import store from './store';
import io from 'socket.io-client';
import VueSocketio from 'vue-socket.io-extended';
import vueRessource from 'vue-resource';
import './plugins/mediaelement';
import localForage from 'localforage';

localForage.config({
  name: 'Togenico',
  storeName: 'Togenico_settings',
});

if (!window.webpackHotUpdate) {
  let socketioServer = window.location.protocol + '//' + window.location.host;
} else {
  // var socketioServer = "http://192.168.43.150:3000";
  let socketioServer = 'http://localhost:3000';
}
const socket = io(socketioServer, {
  timeout: 40000,
  transports: ['websocket'],
});

Vue.use(VueSocketio, socket, { store });
Vue.use(vueRessource);

Vue.config.productionTip = false;

router.beforeEach((to, from, next) => {
  const nearestWithTitle = to.matched
    .slice()
    .reverse()
    .find((r) => r.meta && r.meta.title);

  if (nearestWithTitle) { document.title = nearestWithTitle.meta.title; }

  if (store.state.connected !== true && to.name !== 'home') {
    next({ name: 'home', replace: true, query: { redirect: to.path } });
  } else {
    next();
  }
});

new Vue({
  router,
  store,
  render: (h) => h(App),
  mounted() {
    this.$store.dispatch('getRooms');
    localForage
      .getItem('username')
      .then((uname) =>
        uname ? this.$store.dispatch('setUserName', uname) : null,
      );
  },
}).$mount('#app');
