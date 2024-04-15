import { createApp } from 'vue';
import App from './App.vue'; // Your root component
import { createVuetify } from 'vuetify'; // Import createVuetify
import * as components from 'vuetify/components'; // Import all Vuetify components
import * as directives from 'vuetify/directives'; // Import Vuetify directives

const app = createApp(App);
const vuetify = createVuetify({
  components,
  directives,
});

app.use(vuetify);
app.mount('#app');