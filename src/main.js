import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import store from './store/index'

import http from './utils/http'
Vue.prototype.$http = http

import lodash from 'lodash'
Vue.prototype.$_ = lodash

import cookies from 'vue-cookies'
Vue.use(cookies)

import VueMeta from 'vue-meta'
Vue.use(VueMeta)

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)

import hotkeys from 'hotkeys-js'
Vue.prototype.$hotkeys = hotkeys

// 全局组件自动注册
import './components/autoRegister'

// 自动加载 views
const views = {}
const require_views = require.context('./views/', true, /index.vue$/)
require_views.keys().forEach(fn => {
    views[fn.slice(2, -4)] = require_views(fn).default
})

Vue.prototype.$views = views

// 自动加载 svg 图标
const require_icons = require.context('./assets/icons', false, /\.svg$/)
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(require_icons)

Vue.prototype.$icons = require_icons.keys().map(fn => {
    return {name: fn.slice(2, -4)}
})

import './assets/styles/reset.scss'

Vue.config.productionTip = false

Vue.prototype.$eventBus = new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
