<template>
    <div v-loading="main.loading" element-loading-text="拼命加载中" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
        <page-main>
            <el-row :gutter="32">
                <el-col :span="6">
                    <div class="sub-title" style="margin-bottom: 10px;">
                        用户名 :
                    </div>

                    <el-input v-model="user.params.username" placeholder="请输入内容" style="width: 100%;" />
                </el-col>

                <el-col :span="6">
                    <div class="sub-title" style="margin-bottom: 10px;">
                        真实姓名 :
                    </div>

                    <el-input v-model="user.params.realname" placeholder="请输入内容" style="width: 100%;" />
                </el-col>

                <el-col :span="12">
                    <div class="sub-title" style="margin-bottom: 10px;">
                        所属角色 :
                    </div>

                    <el-select v-model="user.params.role_ids" multiple filterable default-first-option placeholder="请选择" style="width: 100%;">
                        <el-option
                            v-for="item in role.items"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"
                        />
                    </el-select>
                </el-col>

                <el-col :span="12" style="margin-top: 24px;">
                    <div class="sub-title" style="margin-bottom: 10px;">
                        用户状态 :
                    </div>

                    <div>
                        <el-radio v-model="user.params.status" :label="0" border>
                            全部
                        </el-radio>
                        <el-radio v-model="user.params.status" :label="1" border>
                            正常
                        </el-radio>
                        <el-radio v-model="user.params.status" :label="-1" border>
                            禁用
                        </el-radio>
                    </div>
                </el-col>

                <el-col :span="12" style="margin-top: 24px;">
                    <div class="sub-title" style="margin-bottom: 10px;" v-html="'&nbsp;'" />

                    <el-button type="primary" plain @click="handleQueryUserList">
                        查询
                    </el-button>
                    <el-button plain @click="handleResetUserParams">
                        重置
                    </el-button>
                </el-col>
            </el-row>
        </page-main>

        <page-main>
            <el-row>
                <el-button icon="el-icon-plus" plain @click="handlePreCreateUser">
                    新 建
                </el-button>

                <el-button-group v-if="user.item" style="float: right;">
                    <el-button type="primary" icon="el-icon-edit" plain @click="handlePreUpdateUser">
                        编 辑
                    </el-button>

                    <el-button type="danger" icon="el-icon-delete" plain @click="handleDeleteUser">
                        删 除
                    </el-button>
                </el-button-group>

                <el-table :ref="refs.user.table" :data="user.items" tooltip-effect="dark" style="width: 100%; margin-top: 12px;" border highlight-current-row row-key="id" @current-change="handleUserTableCurrentChange">
                    <el-table-column label="用户名称" align="center">
                        <template slot-scope="scope">
                            <span>{{ scope.row.username }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="真实名称" align="center">
                        <template slot-scope="scope">
                            <span>{{ scope.row.realname }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="所属角色" align="center">
                        <template slot-scope="scope">
                            <el-dropdown>
                                <span v-if="scope.row.user_roles && scope.row.user_roles.length > 0">
                                    {{ getRoleName(scope.row.user_roles[0].role_id) }} <i class="el-icon-arrow-down el-icon--right" />
                                </span>

                                <span v-else>
                                    未关联
                                </span>

                                <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item v-for="user_role in scope.row.user_roles" :key="user_role.id">
                                        {{ getRoleName(user_role.role_id) }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </template>
                    </el-table-column>

                    <el-table-column label="用户状态" align="center">
                        <template slot-scope="scope">
                            <span v-if="scope.row.status === 1" style="color: green;">正常</span>
                            <span v-else style="color: red;">禁用</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="邮箱" align="center">
                        <template slot-scope="scope">
                            <span>{{ scope.row.email }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="手机号" align="center">
                        <template slot-scope="scope">
                            <span>{{ scope.row.phone }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="创建时间" align="center">
                        <template slot-scope="scope">
                            <span>{{ scope.row.created_at }}</span>
                        </template>
                    </el-table-column>
                </el-table>

                <el-col :span="24" style="margin-top: 12px;">
                    <span style="color: #808695; font-size: 13px;">
                        当前选中: {{ user.item ? user.item.username : 'null' }}
                    </span>
                    <el-pagination style="float: right;" layout="prev, pager, next" :total="user.total" :current-page="user.params.current" @current-change="handleUserPaginationCurrentChange" />
                </el-col>
            </el-row>
        </page-main>

        <el-dialog :visible.sync="dialogs.user.visible" :close-on-click-modal="false" width="50%">
            <div slot="title">
                <span v-if="dialogs.user.type === main.types.create">
                    新增用户
                </span>

                <span v-else-if="dialogs.user.type === main.types.update">
                    更新用户
                </span>
            </div>

            <el-form :ref="refs.user.form" :model="forms.user" :rules="forms.rules.user" label-position="left" label-width="100px">
                <el-row justify="center" type="flex">
                    <el-col :span="20">
                        <el-form-item label="用户名称" prop="username">
                            <el-input v-model="forms.user.username" style="width: 100%;" placeholder="请输入用户名称" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row justify="center" type="flex">
                    <el-col :span="20">
                        <el-form-item label="真实姓名" prop="realname">
                            <el-input v-model="forms.user.realname" style="width: 100%;" placeholder="请输入真实姓名" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row justify="center" type="flex">
                    <el-col :span="20">
                        <el-form-item label="登录密码" prop="password">
                            <el-input v-model="forms.user.password" type="password" style="width: 100%;" placeholder="请输入登录密码" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row justify="center" type="flex">
                    <el-col :span="20">
                        <el-form-item label="所属角色" prop="role_ids">
                            <el-select v-model="forms.user.role_ids" multiple filterable default-first-option placeholder="请选择所属角色" style="width: 100%;">
                                <el-option
                                    v-for="item in role.items"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id"
                                />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row justify="center" type="flex">
                    <el-col :span="20">
                        <el-form-item label="邮箱" prop="email">
                            <el-input v-model="forms.user.email" style="width: 100%;" placeholder="请输入邮箱地址" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row justify="center" type="flex">
                    <el-col :span="20">
                        <el-form-item label="手机号码" prop="phone">
                            <el-input v-model="forms.user.phone" style="width: 100%;" placeholder="请输入手机号码" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row justify="center" type="flex">
                    <el-col :span="20">
                        <el-form-item label="用户状态">
                            <el-radio v-model="forms.user.status" :label="1" border>
                                正常
                            </el-radio>
                            <el-radio v-model="forms.user.status" :label="-1" border>
                                禁用
                            </el-radio>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogs.user.visible = false">取 消</el-button>
                <el-button v-if="dialogs.user.type === main.types.create" @click="handleCreateUser">
                    提 交
                </el-button>
                <el-button v-if="dialogs.user.type === main.types.update" @click="handleUpdateUser">
                    保 存
                </el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { UserListApi, UserCreateApi, UserUpdateApi, UserDeleteApi } from '@/api/user'
import { RoleListApi } from '@/api/role'

export default {
    name: 'User',
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
                user: {
                    type: 0,
                    loading: false,
                    visible: false
                }
            },

            refs: {
                user: {
                    table: 'user.table',
                    form: 'user.form'
                }
            },

            forms: {
                user: {
                    username: '',
                    realname: '',
                    password: '',
                    email: '',
                    phone: '',
                    status: 1,
                    user_roles: [],
                    role_ids: []
                },
                rules: {
                    user: {
                        username: [{ required: true, message: '用户名不可为空', trigger: 'blur' }],
                        realname: [{ required: true, message: '真实姓名不可为空', trigger: 'blur' }],
                        email: [{ required: true, message: '邮箱不可为空', trigger: 'blur' }],
                        phone: [{ required: true, message: '手机号码不可为空', trigger: 'blur' }]
                    }
                }
            },

            user: {
                params: {
                    username: '',
                    realname: '',
                    query_value: '',
                    role_ids: [],
                    status: 0,

                    // pagination
                    current: 1,
                    page_size: 10
                },

                item: null,
                items: [],
                total: 0
            },

            role: {
                params: {
                    name: '',
                    status: 0,
                    include_menus: 0,

                    // pagination
                    current: 1,
                    page_size: 10
                },

                items: []
            }
        }
    },
    computed: {
        roleMap() {
            return this.role.items.reduce(function(map, item) {
                map[item.id] = item
                return map
            }, {})
        }
    },
    created() {
        this.getRoleList()
        this.getUserList()
    },
    methods: {
        getUserList() {
            let params = this.$_.cloneDeep(this.user.params)
            params.role_ids = params.role_ids.join(',')

            UserListApi(params).then(response => {
                const {list, pagination} = response.data

                this.user.items = list
                this.user.total = pagination.total

                this.$refs[this.refs.user.table].setCurrentRow()
            })
        },

        getRoleList() {
            let params = this.$_.cloneDeep(this.role.params)
            params.page_size = 128

            RoleListApi(params).then(response => {
                const {list} = response.data

                this.role.items = list
            })
        },

        getRoleName(roleID) {
            const role = this.roleMap[roleID]
            if (role && role.name) {
                return role.name
            }

            return 'unknow'
        },

        resetUserForm() {
            this.$nextTick(() => {
                this.$set(this.forms, 'user', {
                    username: '',
                    realname: '',
                    password: '',
                    email: '',
                    phone: '',
                    status: 1,
                    user_roles: [],
                    role_ids: []
                })

                this.$refs[this.refs.user.form].resetFields()
            })
        },

        checkUserForm() {
            let ok = false
            this.$refs[this.refs.user.form].validate(valid => {
                if (!valid) {
                    return this.$message({ message: '表单填写不完整，请确认', type: 'error' })
                }

                ok = true
            })

            return ok
        },

        handleUserTableCurrentChange(val) {
            this.user.item = val
        },

        handleQueryUserList() {
            this.getUserList()
        },

        handleResetUserParams() {
            this.user.params.username = ''
            this.user.params.realname = ''
            this.user.params.query_value = ''
            this.user.params.role_ids = []

            this.menu.item = null
        },

        handleUserPaginationCurrentChange(current) {
            this.user.params.current = current
            this.get_user_list()
        },

        handlePreCreateUser() {
            this.dialogs.user.type = this.main.types.create
            this.dialogs.user.visible = true

            this.resetUserForm()
        },

        handleCreateUser() {
            if (!this.checkUserForm()) {
                return
            }

            let user = this.$_.cloneDeep(this.forms.user)
            user.user_roles = user.role_ids.map(item => {
                return { role_id: item }
            })

            delete user.role_ids
            this.main.loading = true

            UserCreateApi(user).then(() => {
                this.$message({ message: '用户创建成功。', type: 'success' })
                this.dialogs.user.visible = false

                this.resetUserForm()
                this.getUserList()
                this.main.loading = false
            }).catch(() => {
                this.$message({ message: '用户创建出现错误，请联系管理员', type: 'error' })
                this.main.loading = false
            })
        },

        handlePreUpdateUser() {
            const user = this.$_.cloneDeep(this.user.item)
            user.user_roles = user.user_roles || []

            const role_ids = user.user_roles.map(item => { return item.role_id })

            this.$set(this.forms, 'user', {
                username: user.username,
                realname: user.realname,
                password: '',
                email: user.email,
                phone: user.phone,
                status: user.status,
                user_roles: [],
                role_ids: role_ids
            })

            this.dialogs.user.type = this.main.types.update
            this.dialogs.user.visible = true
        },

        handleUpdateUser() {
            if (!this.checkUserForm()) {
                return
            }

            let user = this.$_.cloneDeep(this.forms.user)
            user.user_roles = user.role_ids.map(item => {
                return { role_id: item }
            })

            delete user.role_ids
            this.main.loading = true

            UserUpdateApi(this.user.item.id, user).then(() => {
                this.$message({ message: '用户更新成功。', type: 'success' })
                this.dialogs.user.visible = false

                this.resetUserForm()
                this.getUserList()
                this.main.loading = false
            }).catch(() => {
                this.$message({ message: '用户更新出现错误，请联系管理员', type: 'error' })
                this.main.loading = false
            })
        },

        handleDeleteUser() {
            this.$confirm('此操作将删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.main.loading = true
                UserDeleteApi(this.user.item.id).then(() => {
                    this.$message({ type: 'success', message: '删除成功!' })
                    this.getUserList()
                    this.main.loading = false
                }).catch(() => {
                    this.$message({ message: '用户删除出现错误，请联系管理员', type: 'error' })
                    this.main.loading = false
                })
            })
        }
    }
}
</script>

