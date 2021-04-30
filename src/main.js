import Vue from 'vue';
import App from './App.vue';

// Socket.io
import io from 'socket.io-client';
import VueSocketIOExt from 'vue-socket.io-extended';

// To set/change the port, modify the .env files
const socket = io(process.env.VUE_APP_HOST, {
  autoConnect: false,
});

Vue.use(VueSocketIOExt, socket);

new Vue({
  render: (h) => h(App),
}).$mount('#app');
