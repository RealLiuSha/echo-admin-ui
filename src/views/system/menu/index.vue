<template>
    <div v-loading="main.loading" element-loading-text="拼命加载中" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
        <page-main>
            <el-row :gutter="32">
                <el-col :span="8">
                    <div class="sub-title" style="margin-bottom: 10px;">
                        菜单名称 :
                    </div>

                    <el-input v-model="menu.params.name" :disabled="menu.params.query_value.length > 0" placeholder="请输入内容" style="width: 100%;" />
                </el-col>

                <el-col :span="8">
                    <div class="sub-title" style="margin-bottom: 10px;">
                        菜单名称(模糊查询) :
                    </div>

                    <el-input v-model="menu.params.query_value" :disabled="menu.params.name.length > 0" placeholder="请输入内容" style="width: 100%;" />
                </el-col>
            </el-row>

            <el-row :gutter="32" style="margin-top: 24px;">
                <el-col :span="8" :xl="8" :lg="12">
                    <div class="sub-title" style="margin-bottom: 10px;">
                        展示状态 :
                    </div>

                    <div>
                        <el-radio v-model="menu.params.hidden" :label="0" border>
                            全部
                        </el-radio>

                        <el-radio v-model="menu.params.hidden" :label="-1" border>
                            显示
                        </el-radio>

                        <el-radio v-model="menu.params.hidden" :label="1" border>
                            隐藏
                        </el-radio>
                    </div>
                </el-col>

                <el-col :span="8" :xl="8" :lg="12">
                    <div class="sub-title" style="margin-bottom: 10px;">
                        菜单状态 :
                    </div>

                    <div>
                        <el-radio v-model="menu.params.status" :label="0" border>
                            全部
                        </el-radio>

                        <el-radio v-model="menu.params.status" :label="1" border>
                            启用
                        </el-radio>

                        <el-radio v-model="menu.params.status" :label="-1" border>
                            禁用
                        </el-radio>
                    </div>
                </el-col>

                <el-col :span="8" :xl="8" :lg="24">
                    <div class="sub-title" style="margin-bottom: 10px;" v-html="'&nbsp;'" />

                    <el-button type="primary" plain @click="handleQueryMenuList">
                        查 询
                    </el-button>
                    <el-button plain @click="handleResetMenuParams">
                        重 置
                    </el-button>
                </el-col>
            </el-row>
        </page-main>

        <page-main>
            <el-row :gutter="32">
                <el-col :span="5">
                    <el-tree :data="menuTreeData" :props="{children: 'children',label: 'label'}" />
                </el-col>

                <el-col :span="19" style="border-left: 1px solid lightgray;">
                    <el-button icon="el-icon-plus" plain @click="handlePreCreateMenu">
                        新 建
                    </el-button>

                    <el-button v-if="menu.item" type="primary" icon="el-icon-s-operation" plain @click="handlePreRelatedAction">
                        关联动作
                    </el-button>

                    <el-button-group v-if="menu.item" style="float: right;">
                        <el-button type="primary" icon="el-icon-edit" plain @click="handlePreUpdateMenu">
                            编 辑
                        </el-button>

                        <el-button type="danger" icon="el-icon-delete" plain @click="handleDeleteMenu">
                            删 除
                        </el-button>
                    </el-button-group>

                    <el-table :ref="refs.menu.table" :data="menu.items" tooltip-effect="dark" style="width: 100%; margin-top: 12px;" border highlight-current-row row-key="id" @current-change="handleMenuTableCurrentChange">
                        <el-table-column label="菜单名称" align="center">
                            <template slot-scope="scope">
                                <span>{{ scope.row.name }}</span>
                            </template>
                        </el-table-column>

                        <el-table-column label="排序值" align="center">
                            <template slot-scope="scope">
                                <span>{{ scope.row.sequence }}</span>
                            </template>
                        </el-table-column>

                        <el-table-column label="状态" align="center">
                            <template slot-scope="scope">
                                <span v-if="scope.row.status === 1">启用</span>
                                <span v-else>禁用</span>

                                <span style="margin-left: 8px;">
                                    <svg-icon v-if="scope.row.hidden === -1" name="eye-open" style="color: green;" />
                                    <svg-icon v-else name="eye" style="color: #ea4435;" />
                                </span>
                            </template>
                        </el-table-column>

                        <el-table-column label="菜单图表" align="center">
                            <template slot-scope="scope">
                                <span>
                                    <svg-icon :name="scope.row.icon" />
                                </span>
                            </template>
                        </el-table-column>

                        <el-table-column label="路由" align="center">
                            <template slot-scope="scope">
                                <span>{{ scope.row.router }}</span>
                            </template>
                        </el-table-column>
                    </el-table>

                    <el-row style="margin-top: 12px;">
                        <span style="color: #808695; font-size: 13px;">
                            当前选中: {{ menu.item ? menu.item.name : 'null' }}
                        </span>
                        <el-pagination style="float: right;" layout="prev, pager, next" :total="menu.total" :current-page="menu.params.current" @current-change="handleMenuPaginationCurrentChange" />
                    </el-row>
                </el-col>
            </el-row>
        </page-main>

        <el-drawer v-loading="drawers.menu.loading" :size="650" :visible.sync="drawers.menu.visible" :direction="drawers.menu.direction" class="drawer" element-loading-text="拼命加载中" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)" @close="handleCloseMenuDrawer">
            <div slot="title">
                <span v-if="drawers.menu.type === main.types.create">
                    新增菜单
                </span>

                <span v-else-if="drawers.menu.type === main.types.update">
                    更新菜单
                </span>
            </div>

            <div class="drawer_body">
                <div class="content">
                    <el-form :ref="refs.menu.form" :model="forms.menu" :rules="forms.rules.menu" label-position="top" label-width="100px">
                        <el-row :gutter="32">
                            <el-col :span="12">
                                <el-form-item label="菜单名称" prop="name">
                                    <el-input v-model="forms.menu.name" style="width: 100%;" placeholder="请输入菜单名称" />
                                </el-form-item>
                            </el-col>

                            <el-col :span="12">
                                <el-form-item label="菜单图标" prop="icon">
                                    <el-select v-model="forms.menu.icon" filterable style="width: 100%;" placeholder="请选择菜单图标">
                                        <el-option v-for="icon in $icons" :key="icon.name" :label="icon.name" :value="icon.name">
                                            <span style="float: left;">{{ icon.name }}</span>
                                            <svg-icon style="float: right;" :name="icon.name" />
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>

                            <el-col :span="12">
                                <el-form-item label="父级菜单" prop="parent_ids">
                                    <el-cascader v-model="forms.menu.parent_ids" clearable :options="menuTreeData" :props="{
                                        checkStrictly: true,
                                        expandTrigger: 'hover'
                                    }" style="width: 100%;"
                                    />
                                </el-form-item>
                            </el-col>

                            <el-col :span="12">
                                <el-form-item label="排序值" prop="sequence">
                                    <el-input-number v-model="forms.menu.sequence" style="width: 100%;" :min="1" :max="5000" />
                                </el-form-item>
                            </el-col>

                            <el-col :span="12">
                                <el-form-item label="访问路径" prop="router">
                                    <el-input v-model="forms.menu.router" style="width: 100%;" placeholder="请输入访问路径" />
                                </el-form-item>
                            </el-col>

                            <el-col :span="12">
                                <el-form-item label="组件路径" prop="component">
                                    <el-select v-model="forms.menu.component" clearable filterable default-first-option placeholder="请选择路由组件" style="width: 100%;">
                                        <el-option
                                            v-for="key in Object.keys($views)"
                                            :key="key"
                                            :label="`./views/${key}.vue`"
                                            :value="key"
                                        />
                                    </el-select>
                                </el-form-item>
                            </el-col>

                            <el-col :span="12">
                                <el-form-item label="是否显示" prop="hidden">
                                    <el-radio v-model="forms.menu.hidden" :label="-1" border>
                                        显示
                                    </el-radio>

                                    <el-radio v-model="forms.menu.hidden" :label="1" border>
                                        隐藏
                                    </el-radio>
                                </el-form-item>
                            </el-col>

                            <el-col :span="12">
                                <el-form-item label="状态" prop="status">
                                    <el-radio v-model="forms.menu.status" :label="1" border>
                                        启用
                                    </el-radio>

                                    <el-radio v-model="forms.menu.status" :label="-1" border>
                                        禁用
                                    </el-radio>
                                </el-form-item>
                            </el-col>

                            <el-col :span="24">
                                <el-form-item label="备注" prop="remark">
                                    <el-input v-model="forms.menu.remark" style="width: 100%;" placeholder="请输入" />
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                </div>

                <div class="drawer_footer">
                    <el-button @click="handleCloseMenuDrawer">
                        取 消
                    </el-button>
                    <el-button v-if="drawers.menu.type === main.types.create" type="primary" @click="handleCreateMenu">
                        提 交
                    </el-button>
                    <el-button v-if="drawers.menu.type === main.types.update" type="primary" @click="handleUpdateMenu">
                        提 交
                    </el-button>
                </div>
            </div>
        </el-drawer>

        <MenuAction :visible="drawers.action.visible" :direction="drawers.action.direction" :menu="menu.item" style="height: 100%; width: 100%;" @close="handleCloseActionDrawer" />
    </div>
</template>

<script>
import { MenuListApi, MenuCreateApi, MenuUpdateApi, MenuDeleteApi} from '@/api/menu'
import MenuAction from './components/action'

export default {
    name: 'Menu',
    components: {
        MenuAction
    },
    data() {
        return {
            main: {
                loading: false,
                types: {
                    create: 1,
                    update: 2
                }
            },

            drawers: {
                menu: {
                    type: 0,

                    loading: false,
                    visible: false,
                    direction: 'rtl'
                },

                action: {
                    visible: false,
                    direction: 'rtl'
                }
            },

            refs: {
                menu: {
                    table: 'menu.table',
                    form: 'menu.form'
                }
            },

            forms: {
                menu: {
                    name: '',
                    sequence: 0,
                    icon: '',
                    router: '',
                    component: '',
                    parent_id: '',
                    parent_ids: [],
                    hidden: -1,
                    status: 1,
                    remark: ''
                },

                rules: {
                    menu: {
                        name: [
                            { required: true, trigger: 'blur', message: '请输入菜单名称' }
                        ],
                        icon: [
                            { required: true, trigger: 'blur', message: '请选择菜单图标' }
                        ],
                        remark: [
                            { required: true, trigger: 'blur', message: '请输入备注' }
                        ],
                        router: [
                            { required: true, trigger: 'blur', message: '请输入访问路径' }
                        ],
                        component: [
                            { required: true, trigger: 'change', message: '请选择组件路径' }
                        ]
                    }
                }
            },

            menu: {
                params: {
                    status: 0,
                    hidden: 0,
                    query_value: '',
                    name: '',
                    // 查询树形结构
                    tree: false,

                    // order
                    order_key: 'sequence',
                    order_direction: 'ASC',

                    // pagination
                    current: 1,
                    page_size: 10
                },

                item: null,
                items: [],
                total: 0
            },
            menutree: {
                items: []
            }
        }
    },
    computed: {
        menuTreeData() {
            const data = this.menutree.items.map(item => {
                const m = {
                    label: item.name,
                    value: item.id,
                    children: []
                }

                if (item.children && item.children.length > 0) {
                    item.children.forEach(c => {
                        m.children.push({ label: c.name, value: c.id })
                    })
                }

                return m
            })

            return data
        }
    },
    created() {
        this.main.loading = true
        this.getMenuTree()
        this.getMenuList()
        this.main.loading = false
    },
    methods: {
        getMenuTree() {
            let params = this.$_.cloneDeep(this.menu.params)
            params.tree = true
            params.status = 1
            params.page_size = 128

            MenuListApi(params).then(response => {
                this.menutree.items = response.data
            })
        },

        getMenuList() {
            MenuListApi(this.menu.params).then(response => {
                const {list, pagination} = response.data

                this.menu.items = list
                this.menu.total = pagination.total

                this.$refs[this.refs.menu.table].setCurrentRow()
            })
        },

        refresh() {
            this.$nextTick(() => {
                this.$router.refresh(this.$route.path)
            })
        },

        resetMenuForm() {
            this.$nextTick(() => {
                this.$refs[this.refs.menu.form].resetFields()
            })
        },

        checkMenuForm() {
            let ok = false
            this.$refs[this.refs.menu.form].validate(valid => {
                if (!valid) {
                    return this.$message({ message: '表单填写不完整，请确认', type: 'error' })
                }

                ok = true
            })

            return ok
        },

        handleQueryMenuList() {
            this.getMenuList()
        },

        handleResetMenuParams() {
            this.menu.params.hidden = 0
            this.menu.params.status = 0
            this.menu.params.query_value = ''
            this.menu.params.name = ''
            this.menu.item = null
        },

        handleMenuPaginationCurrentChange(current) {
            this.menu.params.current = current
            this.getMenuList()
        },

        handleMenuTableCurrentChange(val) {
            this.menu.item = val
        },

        handleCloseMenuDrawer() {
            this.drawers.menu.visible = false
        },

        handlePreCreateMenu() {
            this.drawers.menu.type = this.main.types.create
            this.drawers.menu.visible = true

            this.resetMenuForm()
        },

        handleCreateMenu() {
            if (!this.checkMenuForm()) {
                return
            }

            const menu = this.$_.cloneDeep(this.forms.menu)
            if (menu.parent_ids.length > 0) {
                menu.parent_id = menu.parent_ids[menu.parent_ids.length - 1]
            }

            // remove parent_ids
            delete menu.parent_ids

            this.main.loading = true
            MenuCreateApi(menu).then(() => {
                this.$message({ message: '菜单创建成功。', type: 'success' })
                this.drawers.menu.visible = false

                this.resetMenuForm()
                this.getMenuList()
                this.getMenuTree()
                this.refresh()
                this.main.loading = false
            }).catch(() => {
                this.$message({ message: '菜单创建出现错误，请联系管理员', type: 'error' })
                this.main.loading = false
            })
        },

        handlePreUpdateMenu() {
            let menu = this.$_.cloneDeep(this.menu.item)
            menu.parent_ids = menu.parent_path.split('/').filter(i => { return i !== '' })

            this.$set(this.forms, 'menu', menu)

            this.drawers.menu.type = this.main.types.update
            this.drawers.menu.visible = true
        },

        handleUpdateMenu() {
            if (!this.checkMenuForm()) {
                return
            }

            const menu = this.$_.cloneDeep(this.forms.menu)
            if (menu.parent_ids.length > 0) {
                menu.parent_id = menu.parent_ids[menu.parent_ids.length - 1]
            }

            // remove parent_ids
            delete menu.parent_ids

            this.main.loading = true
            MenuUpdateApi(this.menu.item.id, menu).then(() => {
                this.$message({ message: '菜单更新成功。', type: 'success' })
                this.drawers.menu.visible = false

                this.resetMenuForm()
                this.getMenuList()
                this.getMenuTree()
                this.refresh()
                this.main.loading = false
            }).catch(() => {
                this.$message({ message: '菜单更新出现错误，请联系管理员', type: 'error' })
                this.main.loading = false
            })
        },

        handleDeleteMenu() {
            this.$confirm('此操作将删除该菜单, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.main.loading = true
                MenuDeleteApi(this.menu.item.id).then(() => {
                    this.$message({ type: 'success', message: '菜单删除成功!' })
                    this.getMenuList()
                    this.getMenuTree()
                    this.refresh()

                    this.main.loading = false
                }).catch(() => {
                    this.$message({ message: '菜单删除出现错误，请联系管理员', type: 'error' })
                    this.main.loading = false
                })
            })
        },

        handlePreRelatedAction() {
            this.drawers.action.visible = true
        },

        handleCloseActionDrawer() {
            this.drawers.action.visible = false
        }
    }
}
</script>
<style lang="scss" scoped>
.drawer {
    ::v-deep .rtl {
        overflow-y: auto;
        overflow-x: hidden;
    }
    &_body {
        display: flex;
        flex-direction: column;
        height: 100%;
        .content {
            flex: 1;
            padding: 10px 15px;
        }
    }
    &_footer {
        display: flex;
        padding: 10px 15px;
        box-shadow: 0 -2px 9px rgba(153, 169, 191, 0.17);
        button {
            flex: 1;
        }
    }
}
</style>
