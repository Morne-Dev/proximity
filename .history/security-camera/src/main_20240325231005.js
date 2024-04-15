import { createApp } from 'vue'
import App from './App.vue'
import 'vuetify/dist/vuetify.css'
import vuetify from './plugins/vuetify' // Import Vuetify plugin instance

createApp(App)
  .use(vuetify)
  .mount('#app')