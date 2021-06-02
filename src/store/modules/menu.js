import { deepClone } from '@/utils'
import Layout from '@/layout'

// 将多层嵌套路由处理成平级
function flatAsyncRoutes(routes, breadcrumb, baseUrl = '') {
    let res = []
    routes.forEach(route => {
        const tmp = { ...route }
        if (tmp.children) {
            let childrenBaseUrl = ''
            if (baseUrl == '') {
                childrenBaseUrl = tmp.path
            } else if (tmp.path != '') {
                childrenBaseUrl = `${baseUrl}/${tmp.path}`
            }
            let childrenBreadcrumb = deepClone(breadcrumb)
            if (route.meta.breadcrumb !== false) {
                childrenBreadcrumb.push({
                    path: childrenBaseUrl,
                    title: route.meta.title
                })
            }
            let tmpRoute = deepClone(route)
            tmpRoute.path = childrenBaseUrl
            tmpRoute.meta.breadcrumbNeste = childrenBreadcrumb
            delete tmpRoute.children
            res.push(tmpRoute)
            let childrenRoutes = flatAsyncRoutes(tmp.children, childrenBreadcrumb, childrenBaseUrl)
            childrenRoutes.map(item => {
                // 如果 path 一样则覆盖，因为子路由的 path 可能设置为空，导致和父路由一样，直接注册会提示路由重复
                if (res.some(v => v.path == item.path)) {
                    res.forEach((v, i) => {
                        if (v.path == item.path) {
                            res[i] = item
                        }
                    })
                } else {
                    res.push(item)
                }
            })
        } else {
            if (baseUrl != '') {
                if (tmp.path != '') {
                    tmp.path = `${baseUrl}/${tmp.path}`
                } else {
                    tmp.path = baseUrl
                }
            }
            // 处理面包屑导航
            let tmpBreadcrumb = deepClone(breadcrumb)
            if (tmp.meta.breadcrumb !== false) {
                tmpBreadcrumb.push({
                    path: tmp.path,
                    title: tmp.meta.title
                })
            }
            tmp.meta.breadcrumbNeste = tmpBreadcrumb
            res.push(tmp)
        }
    })
    return res
}

function getChildrenPaths(children) {
    let paths = []
    if (!Array.isArray(children)) { return paths }

    for (let item of children) {
        paths.push(item.path)
        paths.push(...getChildrenPaths(item.children))
    }

    return paths
}

const state = {
    isGenerate: false,
    routes: [],
    noChildrenRoutes: [],
    headerActived: 0
}

const getters = {
    sidebarRoutes: state => {
        return state.routes.length > 0 ? state.routes[state.headerActived].children : []
    },
    routePaths: state => {
        let paths = []
        if (state.routes.length < 1) { return paths }

        for (let route of state.routes) {
            paths.push(route.path)
            paths.push(...getChildrenPaths(route.children))
        }

        return paths
    }
}

const actions = {
    // 根据权限动态生成路由
    generateRoutes({rootState, commit}, config) {
        const getView = router => {
            const view = config.views[router]
            if (view) {
                return view
            }

            return config.views['emtpy/index']
        }

        const getChildrenRoutes = children => {
            let routes = []
            if (!Array.isArray(children)) { return routes }

            for (let item of children) {
                let route = {
                    name: item.name,
                    path: item.router,
                    hidden: item.hidden === 1,
                    component: getView(item.component),
                    meta: { title: item.name, icon: item.icon }
                }

                let children = getChildrenRoutes(item.children)
                if (children.length > 0) {
                    route.children = children
                }

                routes.push(route)
            }

            return routes
        }

        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async resolve => {
            let routes = []
            for (let menu of config.menus) {
                let route = {
                    path: `/parent-${menu.id}`,
                    name: menu.name,
                    hidden: menu.hidden === 1,
                    component: Layout,
                    meta: { title: menu.name, icon: menu.icon },
                    children: getChildrenRoutes(menu.children)
                }

                routes.push(route)
            }

            routes.push(...config.localRoutes || [])

            commit('setRoutes', routes)
            commit('setHeaderActived', config.currentPath)

            if (rootState.settings.enableFlatRoutes) {
                routes.map(item => {
                    if (item.children) {
                        item.children = flatAsyncRoutes(item.children, [{
                            path: item.path,
                            title: item.meta.title
                        }])
                    }
                })
            }

            resolve(routes)
        })
    }
}

const mutations = {
    invalidRoutes(state) {
        state.isGenerate = false
        state.headerActived = 0
    },
    setRoutes(state, routes) {
        state.isGenerate = true
        let newRoutes = deepClone(routes)

        state.routes = newRoutes.filter(item => {
            return item.children.length != 0
        })

        state.noChildrenRoutes = newRoutes.filter(item => {
            return item.children.length === 0
        })
    },
    // 根据路由判断属于哪个头部导航
    setHeaderActived(state, path) {
        state.routes.map((item, index) => {
            if (
                item.children.some(r => {
                    return path.indexOf(r.path + '/') === 0 || path == r.path
                })
            ) {
                state.headerActived = index
            }
        })
    },
    // 切换头部导航
    switchHeaderActived(state, index) {
        state.headerActived = index
    }
}

export default {
    namespaced: true,
    state,
    actions,
    getters,
    mutations
}
