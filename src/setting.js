let globalSettings = {
    /**
     * 是否开启权限功能，权限功能提供以下鉴权支持：
     * 1、路由鉴权
     * 2、鉴权组件：<Auth></Auth>、<AuthAll></AuthAll>
     * 3、鉴权指令：v-auth、v-auth-all
     * 4、鉴权函数：this.$auth()、this.$authAll()
     */
    openPermission: false,
    // 是否开启侧边栏展开收起按钮
    enableSidebarCollapse: true,
    // 侧边栏是否收起
    sidebarCollapse: false,
    // 是否显示底部版权信息，同时在路由 meta 对象里可以单独设置某个路由是否显示底部版权信息
    showCopyright: true,
    // 版权信息配置，格式为：Copyright © [dates] <company>
    copyrightDates: '2021',
    copyrightCompany: 'Echo-Admin',
    copyrightWebsite: 'https://github.com/RealLiuSha/echo-admin-ui',
    // 是否开启导航搜索
    enableNavSearch: true,
    // 是否开启全屏
    enableFullscreen: false,
    // 是否开启页面刷新
    enablePageReload: true,
    // 是否开启载入进度条
    enableProgress: true,
    // 是否开启动态标题
    enableDynamicTitle: true,
    // 是否开启扁平化路由，开启后三级以及三级以上的嵌套路由均为被处理成二级，但侧边栏导航的层级效果不变
    enableFlatRoutes: false,
    // 是否开启主题配置（建议在生产环境关闭）
    enableThemeSetting: true
}

export default globalSettings
