import axios from 'axios'
import store from '@/store/index'
import { MessageBox, Message } from 'element-ui'

const http = axios.create({
    baseURL: process.env.VUE_APP_API_ROOT,
    timeout: 10000,
    responseType: 'json'
})

http.interceptors.request.use(
    config => {
        if (store.getters['user/isLogin']) {
            config.headers['Authorization'] = `Bearer ${store.state.user.token}`
        }

        return config
    },
    error => {
        return Promise.reject(error)
    }
)

http.interceptors.response.use(
    response => {
        return Promise.resolve(response.data)
    },
    error => {
        const response = error.response

        if (error.code === 'ECONNABORTED') {
            Message({
                message: error.message,
                type: 'error',
                duration: 5 * 1000
            })
        } else if (response) {
            if (response.status === 401) {
                MessageBox.confirm('登录态已失效， 请重新登录！', '登出', {
                    confirmButtonText: '重新登录',
                    showCancelButton: false,
                    closeOnPressEscape: false,
                    closeOnClickModal: false,
                    showClose: false,
                    type: 'warning'
                }).then(() => {
                    store.commit('user/removeUserData')
                    store.commit('menu/invalidRoutes')

                    location.reload()
                })
            } else {
                let msg
                if (response.data && response.data.message) {
                    msg = response.data.message
                }

                Message({
                    message: msg || error.message,
                    type: 'error',
                    duration: 5 * 1000
                })
            }
        } else {
            Message({
                message: error.message,
                type: 'error',
                duration: 5 * 1000
            })
        }

        return Promise.reject(error)
    }
)

export default http
