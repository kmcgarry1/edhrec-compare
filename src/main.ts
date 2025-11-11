import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { useTheme } from './composables/useTheme'

useTheme()

createApp(App).mount('#app')
