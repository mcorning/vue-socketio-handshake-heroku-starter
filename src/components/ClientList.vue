<template>
  <div class="clients">
    <h3 v-html="'All clients'" />

    <span
      v-if="clients.length == 0"
      v-html="'No connected clients.'"
      style="opacity: 0.5"
    />
    <ol v-if="clients.length > 0">
      <li v-for="client in clients" :key="client.userID">
        {{ client.userID }} Connected: {{ client.connected }}
      </li>
    </ol>
  </div>
</template>

<script>
export default {
  data() {
    return {
      clients: [],
      client: null,
    };
  },
  sockets: {
    /*
     * 👂 Listen to socket events emitted from the socket server
     */
    users(users) {
      // users is a Map object, so flatten it
      this.clients = users.map((v) => v[1]);
      console.log(JSON.stringify(this.clients, null, 3));
    },
    userConnected(user) {
      this.client = user;
    },
  },
};
</script>

<style scoped>
.clients {
  width: 100%;
  margin-top: 32px;
  padding-top: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
