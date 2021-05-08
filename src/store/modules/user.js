import { UserLoginApi, UserMenuTreeApi, UserLogoutApi } from '@/api/public'

const state = {
    username: localStorage.username || '',
    token: localStorage.token || '',
    menus: [],
    permissions: []
}

const getters = {
    isLogin: state => {
        if (state.token) {
            return true
        }

        return false
    }
}

const actions = {
    login({commit}, data) {
        const { username } = data
        return new Promise((resolve, reject) => {
            UserLoginApi(data).then(res => {
                const { token } = res.data

                commit('setUserData', {username: username, token: token })
                resolve()
            }).catch(err => { reject(err) })
        })
    },
    logout({commit}) {
        return new Promise((resolve, reject) => {
            UserLogoutApi().then(() => {
                commit('removeUserData')
                commit('menu/invalidRoutes', null, {root: true})
                resolve()
            }).catch(err => { reject(err) })
        })
    },
    getMenuTree({commit}) {
        return new Promise((resolve, reject) => {
            UserMenuTreeApi().then(res => {
                const menus  = res.data

                commit('setMenuData', {menus: menus})
                resolve(menus)
            }).catch(error => {
                reject(error)
            })
        })
    }
}

const mutations = {
    setUserData(state, payload) {
        localStorage.setItem('username', payload.username)
        localStorage.setItem('token', payload.token)

        state.username = payload.username
        state.token = payload.token
    },
    removeUserData(state) {
        localStorage.removeItem('username')
        localStorage.removeItem('token')

        state.username = ''
        state.token = ''
    },
    setMenuData(state, payload) {
        state.menus = payload.menus
    },
    setPermissions(state, permissions) {
        state.permissions = permissions
    }
}

export default {
    namespaced: true,
    state,
    actions,
    getters,
    mutations
}
