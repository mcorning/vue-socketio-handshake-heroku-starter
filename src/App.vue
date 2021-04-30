<template>
  <div id="app">
    <div class="container">
      <h1>Socket.io V3 Handshake Protocol*</h1>
      <h2>For vue-socket.io-extended</h2>
      <input id="input" v-model="username" placeholder="Enter nickname" />
      <button
        @click.prevent="connectMe()"
        v-html="'Connect Me'"
        style="font-size: 1.25em"
      />
      <h3
        :style="isConnected ? 'color: green' : 'color: red'"
        v-html="`Connected: ${isConnected}`"
      />
      <ClientList />
      <div>
        <p>
          *Based on
          <a
            href="https://github.com/socketio/socket.io/tree/master/examples/private-messaging"
            >Private Messaging Repo</a
          >
          by
          <a href="mailto:damien.arrachequesne@gmail.com">
            Damien Arrachequesne
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import ClientList from './components/ClientList.vue';

export default {
  name: 'App',
  data() {
    return {
      isConnected: false,
      usernameAlreadySelected: false,
      sessionID: '',
      username: '',
    };
  },
  components: {
    ClientList,
  },
  sockets: {
    /*
     * 👂 Listen to socket events emitted from the socket server
     */
    connect() {
      console.log('Connected to the socket server.');
      this.isConnected = true;
    },

    session({ sessionID, userID, username, graphName }) {
      // attach the session ID to the next reconnection attempts
      this.$socket.client.auth = { sessionID };
      // store it in the localStorage
      localStorage.setItem('sessionID', sessionID);
      // save the ID of the user
      // TODO isn't userID already assigned in middleware?
      this.$socket.client.userID = userID;
      // this.sid = sessionID;
      this.username = username;
      console.log('on Session', this.username);

      this.userID = userID;
      this.graphName = graphName;
    },
  },
  methods: {
    connectMe() {
      localStorage.setItem('username', this.username);

      console.log('Connecting', this.username);
      this.$socket.client.auth = {
        username: this.username,
        sessionID: this.sessionID,
      };
      this.$socket.client.open();
    },
  },

  created() {
    this.sessionID = localStorage.getItem('sessionID');
    this.username = localStorage.getItem('username');
    console.log('created()', this.username);

    if (this.sessionID) {
      this.usernameAlreadySelected = true;
      // this.sid = sessionID;
      this.$socket.client.auth = {
        sessionID: this.sessionID,
        username: this.username,
      };
      // if server finds a session we will connect
      this.$socket.client.open();
    }
  },
};
</script>

<style>
body,
html {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 0;
}
* {
  box-sizing: border-box;
}

#app {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}
</style>
