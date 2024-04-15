import { createApp } from 'vue'
import App from './App.vue'
import { Vuetify } from 'vuetify'

const app = createApp(App)

app.use(Vuetify)

app.mount('#app')
