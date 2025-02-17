<!--
ETK - Eniwer Training Kit
Copyright (C) 2025 Felipe Andrés Solís Albanese

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->
<script>
import { RouterView } from 'vue-router'
import { computed } from 'vue'
import { useStore } from 'vuex'
import io from 'socket.io-client'

export default {
  name: 'App',
  data() {
    return {
      loading: true,
    }
  },
  components: [
    RouterView,
  ],
  setup () {
    const store = useStore()
    return {
      system: computed(() => store.getters.system),
      session: computed(() => store.getters.session),
      ui_theme: computed(() => store.getters.system.settings.ui.theme),
      refresh: () => store.dispatch('refresh'),
    }
  },
  created() {
    const socket = io(this.websocketURL + '/priv', { autoConnect: false });
    this.$store.dispatch('saveSocket', { socket });
    if (this.session.api.refresh_token != null) {
      this.refresh().then(() => {
        this.$store.dispatch('user').then(() => {
          socket.auth = { token: this.websocket.token };
          if(!socket.connected) socket.connect();
          socket.on('connect', () => this.websocket.online = true);
          socket.on('disconnect', () => this.websocket.online = false);

          // Listen for task_updated event
          socket.on('task_updated', (task) => {
            console.log({ task });
            this.$store.commit('update_task', task);
          });
        });
      });
    }
    window.addEventListener('resize',
        this.debounce(() => {
          this.handleResize()
        }, 250)
    )
    this.handleResize();
  },
  mounted() {
  },
  unmounted() {
    window.removeEventListener('resize', this.handleResize);
  },
  computed: {
    websocket: {
      get() { return this.$store.getters.websocket; },
      set(data) { this.$store.commit('websocket', data); }
    },
    websocketURL() { return import.meta.env.VITE_APP_WEBSOCKET },
  },
  methods: {
    handleResize() {
      this.$store.commit('screen', { width: window.innerWidth, height: window.innerHeight});
    },
    debounce(callback, wait) {
      let timerId;
      return (...args) => {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
          callback(...args);
        }, wait);
      };
    },
    toggleTheme() {
      this.system.settings.ui.theme = this.system.settings.ui.theme == 'dark' ? 'light' : 'dark';
    },
  }
}
</script>

<template>
  <div :class="{ 'body-dark' : system.settings.ui.theme === 'dark' }">
    <div v-if="session.api.active === false && this.$route.meta.scope === 'private'">
      <div class="container text-center">
        <p class="fs-15 pt-5 mb-4" :class="{ 'text-white' : ui_theme === 'dark', 'text-secondary' : ui_theme === 'light' }">Verificando Acceso</p>
        <div class="spinner-grow text-primary" role="status"></div>
      </div>
    </div>
    <div v-else :data-bs-theme="ui_theme === 'dark' ? 'dark' : null">
      <nav class="navbar navbar-expand-lg border-bottom" v-if="session.api.active === true" :class="{ 'bg-dark text-white' : system.settings.ui.theme === 'dark' }" :data-bs-theme="system.settings.ui.theme === 'dark' ? 'dark' : null">
        <div class="container-fluid">
          <a class="navbar-brand" href="#" @click="this.$router.push({ name: 'Home' })">
            Eniwer
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#coreNavbar" aria-controls="coreNavbar" aria-expanded="false" aria-label="Cambiar Navegación">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="coreNavbar">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="nav-link" aria-current="page" href="#" @click="this.$router.push({ name: 'Tasks' })" :class="{ 'fw-bold' : this.$route.name == 'Tasks' }">Tareas</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#" @click="this.$router.push({ name: 'Users' })" :class="{ 'fw-bold' : this.$route.name == 'Users' }">Sistema</a>
              </li>
            </ul>
            <div class="row">
              <div class="col">
                <div v-if="websocket.online === true">
                  <i class="fas fa-circle text-success fs-07"></i>
                </div>
                <div v-if="websocket.online === false">
                  <i class="fas fa-circle text-danger fs-07"></i>
                </div>
              </div>
              <div class="col">
                <i class="fas fa-moon" :class="{ 'text-white' : system.settings.ui.theme === 'dark' }" @click="toggleTheme()" role="button"></i>
              </div>
              <div class="col">
                <a class="nav-link" href="#" @click="this.$router.push({ name: 'Logout' })">Salir</a>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <RouterView></RouterView>
    </div>
  </div>
</template>