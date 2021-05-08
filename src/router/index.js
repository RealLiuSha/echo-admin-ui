
import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store/index'
import Layout from '@/layout'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css' // progress bar style

Vue.use(VueRouter)

const constantRoutes = [
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/login'),
        meta: {
            title: '登录'
        }
    },
    {
        path: '/reload',
        name: 'reload',
        component: () => import('@/views/reload')
    }
]

const localRoutes = [
    {
        path: '',
        name: 'static',
        hidden: false,
        meta: {
            title: '静态页面',
            icon: 'sidebar-component'
        },
        component: Layout,
        children: [
            {
                path: '/static/button',
                hidden: false,
                name: 'button',
                component: () => import('@/views/static/button'),
                meta: {title: '按钮', icon: 'layout'}
            },
            {
                path: '/static/icon',
                hidden: false,
                name: 'select',
                component: () => import('@/views/static/select'),
                meta: {title: '选择框', icon: 'layout'}
            },
            {
                path: '/static/input',
                hidden: false,
                name: 'input',
                component: () => import('@/views/static/input'),
                meta: {title: '输入框', icon: 'layout'}
            }
        ]
    },
    {
        path: '',
        name: 'other',
        hidden: false,
        meta: {title: '外链', icon: 'sidebar-other'},
        children: [
            {
                path: 'https://github.com/RealLiuSha/echo-admin',
                name: 'github',
                hidden: false,
                meta: {
                    title: 'Github',
                    icon: 'sidebar-external-link'
                }
            }
        ]
    }
]

const lastRoute = [{
    path: '*',
    component: () => import('@/views/404'),
    meta: {
        title: '404',
        sidebar: false
    }
}]

const router = new VueRouter({
    routes: constantRoutes
})

// 解决路由在 push/replace 了相同地址报错的问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
}

const originalReplace = VueRouter.prototype.replace
VueRouter.prototype.replace = function replace(location) {
    return originalReplace.call(this, location).catch(err => err)
}

VueRouter.prototype.refresh = async function refresh(currentPath) {
    let routes = router.app.$_.cloneDeep(constantRoutes)

    routes.push(
        ...lastRoute,
        ...await store.dispatch('menu/generateRoutes', {
            localRoutes: localRoutes,

            menus: await store.dispatch('user/getMenuTree'),
            views: router.app.$views,
            currentPath: currentPath
        })
    )

    // https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
    router.matcher = new VueRouter({
        routes: routes
    }).matcher
}

router.beforeEach(async(to, from, next) => {
    store.state.settings.enableProgress && NProgress.start()
    // 已经登录，但还没根据权限动态挂载路由
    if (store.getters['user/isLogin'] && !store.state.menu.isGenerate) {
        await router.refresh(to.path)

        next({ ...to, replace: true })
    }

    if (store.state.menu.isGenerate) {
        store.commit('menu/setHeaderActived', to.path)
    }

    to.meta.title && store.commit('settings/setTitle', to.meta.title)
    if (store.getters['user/isLogin']) {
        if (to.name) {
            if (to.matched.length !== 0) {
                // 如果已登录状态下，进入登录页会强制跳转到侧边栏导航第一个模块
                if (to.name == 'login') {
                    if (store.getters['menu/sidebarRoutes'].length > 0) {
                        next({
                            name: store.getters['menu/sidebarRoutes'][0].name,
                            replace: true
                        })
                    }
                }
            } else {
                // 如果是通过 name 跳转，并且 name 对应的路由没有权限时，需要做这步处理，手动指向到 404 页面
                next({
                    path: '/404'
                })
            }
        }
    } else {
        if (to.name != 'login') {
            next({
                name: 'login',
                query: {
                    redirect: to.fullPath
                }
            })
        }
    }

    next()
})

router.afterEach(() => {
    store.state.settings.enableProgress && NProgress.done()
})

export default router
