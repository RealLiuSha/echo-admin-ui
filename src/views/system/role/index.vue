<template>
    <div v-loading="main.loading" element-loading-text="拼命加载中" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
        <page-main>
            <el-row :gutter="32">
                <el-col :span="8" :xl="8" :lg="6">
                    <div class="sub-title" style="margin-bottom: 10px;">
                        角色名 :
                    </div>

                    <el-input v-model="role.params.name" placeholder="请输入内容" style="width: 100%;" />
                </el-col>

                <el-col :span="8" :xl="8" :lg="12">
                    <div class="sub-title" style="margin-bottom: 10px;">
                        角色状态 :
                    </div>

                    <div>
                        <el-radio v-model="role.params.status" :label="0" border>
                            全部
                        </el-radio>

                        <el-radio v-model="role.params.status" :label="1" border>
                            启用
                        </el-radio>

                        <el-radio v-model="role.params.status" :label="-1" border>
                            禁用
                        </el-radio>
                    </div>
                </el-col>

                <el-col :span="8" :xl="8" :lg="6">
                    <div class="sub-title" style="margin-bottom: 10px;" v-html="'&nbsp;'" />

                    <el-button type="primary" plain @click="handleQueryRoleList">
                        查询
                    </el-button>
                    <el-button plain @click="handleResetRoleParams">
                        重置
                    </el-button>
                </el-col>
            </el-row>
        </page-main>

        <page-main>
            <el-row :gutter="32">
                <el-col :span="24">
                    <el-button icon="el-icon-plus" plain @click="handlePreCreateRole">
                        新 建
                    </el-button>

                    <el-button-group v-if="role.item" style="float: right;">
                        <el-button type="primary" icon="el-icon-edit" plain @click="handlePreUpdateRole">
                            编 辑
                        </el-button>

                        <el-button type="danger" icon="el-icon-delete" plain @click="handleDeleteRole">
                            删 除
                        </el-button>
                    </el-button-group>

                    <el-table :ref="refs.role.table" :data="role.items" tooltip-effect="dark" style="width: 100%; margin-top: 12px;" border highlight-current-row row-key="id" @current-change="handleRoleTableCurrentChange">
                        <el-table-column label="角色名称" align="center" width="300">
                            <template slot-scope="scope">
                                <span>{{ scope.row.name }}</span>
                            </template>
                        </el-table-column>

                        <el-table-column label="排序值" align="center" width="150">
                            <template slot-scope="scope">
                                <span>{{ scope.row.sequence }}</span>
                            </template>
                        </el-table-column>

                        <el-table-column label="状态" align="center" width="150">
                            <template slot-scope="scope">
                                <span v-if="scope.row.status === 1">启用</span>
                                <span v-else>禁用</span>
                            </template>
                        </el-table-column>

                        <el-table-column label="备注" align="center">
                            <template slot-scope="scope">
                                <span>{{ scope.row.remark }}</span>
                            </template>
                        </el-table-column>
                    </el-table>

                    <el-row style="margin-top: 12px;">
                        <span style="color: #808695; font-size: 13px;">
                            当前选中: {{ role.item ? role.item.name : 'null' }}
                        </span>
                        <el-pagination style="float: right;" layout="prev, pager, next" :total="role.total" :current-page="role.params.current" @current-change="handleRolePaginationCurrentChange" />
                    </el-row>
                </el-col>
            </el-row>
        </page-main>

        <el-dialog :visible.sync="dialogs.role.visible" :close-on-click-modal="false" width="60%">
            <div slot="title">
                <span v-if="dialogs.role.type === main.types.create">
                    新增角色
                </span>

                <span v-else-if="dialogs.role.type === main.types.update">
                    更新角色
                </span>
            </div>

            <el-form :ref="refs.role.form" :model="forms.role" :rules="forms.rules.role" label-position="top" label-width="100px">
                <el-row :gutter="32">
                    <el-col :span="12">
                        <el-form-item label="角色名称" prop="name">
                            <el-input v-model="forms.role.name" style="width: 100%;" placeholder="请输入角色名称" />
                        </el-form-item>
                    </el-col>

                    <el-col :span="12">
                        <el-form-item label="描述" prop="remark">
                            <el-input v-model="forms.role.remark" style="width: 100%;" placeholder="请输入描述信息" />
                        </el-form-item>
                    </el-col>

                    <el-col :span="12">
                        <el-form-item label="排序值">
                            <el-input-number v-model="forms.role.sequence" style="width: 100%;" :min="1000" :max="10000" />
                        </el-form-item>
                    </el-col>

                    <el-col :span="12">
                        <el-form-item label="状态" prop="status">
                            <el-radio v-model="forms.role.status" :label="1" border>
                                启用
                            </el-radio>

                            <el-radio v-model="forms.role.status" :label="-1" border>
                                禁用
                            </el-radio>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>

            <el-divider content-position="center">
                菜单权限
            </el-divider>

            <el-row :gutter="32">
                <el-col :span="6">
                    <el-tree :ref="refs.menu.tree" :data="menuTreeData" show-checkbox default-expand-all node-key="label" highlight-current check-strictly :props="{children: 'children',label: 'label'}" @check-change="handleMenuTreeCheckChange" />
                </el-col>

                <el-col :span="18" style="border-left: 1px solid lightgray;">
                    <el-tabs tab-position="top" style="height: 200px;">
                        <el-tab-pane v-for="(tab, name) in forms.role.tabs" :key="tab.id" :label="name">
                            <el-row v-if="tab.model.length > 0">
                                <el-checkbox-group v-model="tab.model">
                                    <el-checkbox v-for="action in tab.actions" :key="action.id" :label="action.id">
                                        {{ action.name }}
                                    </el-checkbox>
                                </el-checkbox-group>
                            </el-row>

                            <el-row v-else class="notice_text">
                                <p>当前菜单未关联任何动作权限</p>
                            </el-row>
                        </el-tab-pane>
                    </el-tabs>
                </el-col>
            </el-row>

            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogs.role.visible = false">取 消</el-button>
                <el-button v-if="dialogs.role.type === main.types.create" @click="handleCreateRole">
                    提 交
                </el-button>
                <el-button v-if="dialogs.role.type === main.types.update" @click="handleUpdateRole">
                    保 存
                </el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { RoleListApi, RoleCreateApi, RoleUpdateApi, RoleDeleteApi, RoleDetailApi } from '@/api/role'
import { MenuListApi } from '@/api/menu'

export default {
    name: 'Role',
    data() {
        return {
            main: {
                loading: false,
                types: {
                    create: 1,
                    update: 2
                }
            },

            dialogs: {
                role: {
                    type: 0,
                    loading: false,
                    visible: false
                }
            },

            refs: {
                role: {
                    table: 'role.table',
                    form: 'role.form'
                },
                menu: {
                    tree: 'menu.tree'
                }
            },

            forms: {
                role: {
                    name: '',
                    sequence: 1000,
                    remark: '',
                    status: 1,
                    role_menus: [],
                    // just to render tabs
                    // {<menuName>: {id: <menuID>, actions: [], model: []}}
                    tabs: {}
                },
                rules: {
                    role: {
                        name: [{ required: true, message: '角色名称不可为空', trigger: 'blur' }],
                        remark: [{ required: true, message: '描述不可为空', trigger: 'blur' }]
                    }
                }
            },

            role: {
                params: {
                    name: '',
                    status: 0,
                    include_menus: 1,

                    // pagination
                    current: 1,
                    page_size: 10
                },

                item: null,
                items: [],
                total: 0
            },
            menu: {
                params: {
                    status: 0,
                    hidden: 0,
                    query_value: '',
                    name: '',
                    // 查询树形结构
                    tree: false,
                    // 查询关联的 actions
                    include_actions: false,

                    // order
                    order_key: 'sequence',
                    order_direction: 'ASC',

                    // pagination
                    current: 1,
                    page_size: 10
                },

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
        },
        menuMap() {
            return this.menu.items.reduce(function(map, item) {
                map[item.id] = item
                return map
            }, {})
        }
    },
    created() {
        this.getMenuTree()
        this.getMenuList()
        this.getRoleList()
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
            let params = this.$_.cloneDeep(this.menu.params)
            params.page_size = 128
            params.include_actions = true

            MenuListApi(params).then(response => {
                const {list, pagination} = response.data

                this.menu.items = list
                this.menu.total = pagination.total
            })
        },

        async getRoleDetail(id) {
            await RoleDetailApi(id).then(response => {
                this.role.item = response.data
                this.role.item.role_menus = this.role.item.role_menus || []
            })
        },

        getRoleList() {
            RoleListApi(this.role.params).then(response => {
                const {list, pagination} = response.data

                this.role.items = list
                this.role.total = pagination.total

                this.$refs[this.refs.role.table].setCurrentRow()
            })
        },

        resetRoleForm() {
            this.$nextTick(() => {
                this.$set(this.forms, 'role', {
                    name: '',
                    sequence: 1000,
                    remark: '',
                    status: 1,
                    role_menus: [],
                    tabs: {}
                })

                this.$refs[this.refs.role.form].resetFields()
                this.$refs[this.refs.menu.tree].setCheckedKeys([])
            })
        },

        checkRoleForm() {
            let ok = false
            this.$refs[this.refs.role.form].validate(valid => {
                if (!valid) {
                    return this.$message({ message: '表单填写不完整，请确认', type: 'error' })
                }

                ok = true
            })

            return ok
        },

        handleQueryRoleList() {
            this.getRoleList()
        },

        handleResetRoleParams() {
            this.menu.params.name = ''
            this.menu.params.status = 0

            this.menu.item = null
        },

        handleRolePaginationCurrentChange(current) {
            this.role.params.current = current
            this.getRoleList()
        },

        handleRoleTableCurrentChange(val) {
            this.role.item = val
        },

        handlePreCreateRole() {
            this.dialogs.role.type = this.main.types.create
            this.dialogs.role.visible = true

            this.resetRoleForm()
        },

        handleMenuTreeCheckChange(data, checked, indeterminate) {
            let menu = this.menuMap[data.value]
            menu.actions = menu.actions || []

            if (checked && !this.forms.role.tabs[menu.name]) {
                this.$set(this.forms.role.tabs, menu.name, {
                    id: menu.id,
                    actions: menu.actions,
                    model: menu.actions.map(item => { return item.id })
                })
            } else if (!checked && !indeterminate) {
                this.$delete(this.forms.role.tabs, data.label)
            }

        },

        handleCreateRole() {
            if (!this.checkRoleForm()) {
                return
            }

            let role = this.$_.cloneDeep(this.forms.role)
            for (const tab of Object.values(role.tabs)) {
                for (const v of tab.model) {
                    role.role_menus.push({
                        menu_id: tab.id,
                        action_id: v
                    })
                }
            }

            delete role.tabs
            this.main.loading = true

            RoleCreateApi(role).then(() => {
                this.$message({ message: '角色创建成功。', type: 'success' })
                this.dialogs.role.visible = false

                this.resetRoleForm()
                this.getRoleList()
                this.main.loading = false
            }).catch(() => {
                this.$message({ message: '角色创建出现错误，请联系管理员', type: 'error' })
                this.main.loading = false
            })
        },

        async handlePreUpdateRole() {
            await this.getRoleDetail(this.role.item.id)

            let keys = [] // menutree checked keys
            let role = this.$_.cloneDeep(this.role.item)
            this.forms.role.name = role.name
            this.forms.role.sequence = role.sequence
            this.forms.role.remark = role.remark
            this.forms.role.tabs = {}
            this.forms.role.role_menus = []

            let tabs = {}
            role.role_menus.forEach(role_menu => {
                const menu = this.menuMap[role_menu.menu_id]
                tabs[menu.name] = tabs[menu.name] || {
                    id: menu.id,
                    actions: menu.actions,
                    model: []
                }

                tabs[menu.name].model.push(role_menu.action_id)
                keys.push(menu.name)
            })

            for (const [key, value] of Object.entries(tabs)) {
                this.$set(this.forms.role.tabs, key, value)
            }

            this.dialogs.role.type = this.main.types.update
            this.dialogs.role.visible = true

            this.$nextTick(() => {
                this.$refs[this.refs.menu.tree].setCheckedKeys(keys)
            })
        },

        handleUpdateRole() {
            if (!this.checkRoleForm()) {
                return
            }

            let role = this.$_.cloneDeep(this.forms.role)
            for (const tab of Object.values(role.tabs)) {
                for (const v of tab.model) {
                    role.role_menus.push({
                        menu_id: tab.id,
                        action_id: v
                    })
                }
            }

            delete role.tabs
            this.main.loading = true

            RoleUpdateApi(this.role.item.id, role).then(() => {
                this.$message({ message: '角色更新成功。', type: 'success' })
                this.dialogs.role.visible = false

                this.resetRoleForm()
                this.getRoleList()
                this.main.loading = false
            }).catch(() => {
                this.$message({ message: '角色更新出现错误，请联系管理员', type: 'error' })
                this.main.loading = false
            })
        },

        handleDeleteRole() {
            this.$confirm('此操作将删除该角色, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.main.loading = true
                RoleDeleteApi(this.role.item.id).then(() => {
                    this.$message({ type: 'success', message: '删除成功!' })
                    this.getRoleList()
                    this.main.loading = false
                }).catch(() => {
                    this.$message({ message: '角色删除出现错误，请联系管理员', type: 'error' })
                    this.main.loading = false
                })
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.notice_text {
    margin-top: 5px;
    color: #8492a6;
    font-size: 14px;
    p {
        text-align: center;
        display: block;
    }
}
</style>
