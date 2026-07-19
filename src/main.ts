import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import { log } from "./logger"
import "@/assets/css/styles.scss"

const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  log('error', 'Unhandled Vue error', {
    error: String(err),
    info,
    component: instance?.$?.type?.name ?? 'unknown',
  })
}

app.use(createPinia()).mount("#app")
