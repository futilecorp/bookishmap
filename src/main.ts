import './assets/main.css'

import {createApp} from 'vue'
import OpenBook from './OpenBook.vue'
import VueMobileDetection from 'vue-mobile-detection'

const app = createApp(OpenBook)

app.use(VueMobileDetection)

app.mount('#app')