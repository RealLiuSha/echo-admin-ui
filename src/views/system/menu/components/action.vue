<template>
    <el-drawer v-loading="main.loading" class="drawer" title="关联动作" :size="600" :visible.sync="isVisible" :direction="direction" element-loading-text="拼命加载中" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
        <div class="drawer_body">
            <div class="drawer_action">
                <el-button icon="el-icon-plus" plain @click="handlePreCreateAction">
                    新 建
                </el-button>

                <el-button icon="el-icon-delete" type="danger" style="float: right;" plain @click="handleCleanActions">
                    清 空
                </el-button>
            </div>

            <div class="content">
                <el-table :data="action.items" style="width: 100%;">
                    <el-table-column label="编号" align="center">
                        <template slot-scope="scope">
                            <span>{{ scope.row.code }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="名称" align="center">
                        <template slot-scope="scope">
                            <span>{{ scope.row.name }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" align="center">
                        <template slot-scope="scope">
                            <el-button type="text" size="small" @click="handlePreUpdateAction(scope.$index)">编辑</el-button>
                            <el-button type="text" size="small" @click="handleDeleteAction(scope.$index)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="drawer_footer">
                <el-button @click="handleClose">
                    取 消
                </el-button>
                <el-button type="primary" @click="handleUpdateActions">
                    提 交
                </el-button>
            </div>
        </div>

        <el-dialog append-to-body :visible.sync="dialogs.action.visible" width="50%">
            <div slot="title">
                <span v-if="dialogs.action.type === main.types.create">
                    新增动作
                </span>

                <span v-else-if="dialogs.action.type === main.types.update">
                    更新动作
                </span>
            </div>

            <el-form :ref="refs.action.form" :model="forms.action" :rules="forms.rules.action" label-position="top" label-width="100px">
                <el-row :gutter="32">
                    <el-col :span="12">
                        <el-form-item label="动作编号" prop="code">
                            <el-input v-model="forms.action.code" style="width: 100%;" placeholder="请输入动作编号" />
                        </el-form-item>
                    </el-col>

                    <el-col :span="12">
                        <el-form-item label="动作名称" prop="name">
                            <el-input v-model="forms.action.name" style="width: 100%;" placeholder="请输入菜单名称" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>

            <el-row style="margin-top: 12px; font-size: 14px;">
                <b style="color: #909399;">资源列表</b>
                <span style="float: right;" class="link-type" @click="handleCreateActionResource">新增</span>
                <el-divider />
            </el-row>

            <el-table :data="forms.action.resources" style="width: 100%;">
                <el-table-column label="请求方式" align="center">
                    <template slot-scope="scope">
                        <el-select v-model="scope.row.method" placeholder="请选择">
                            <el-option
                                v-for="method in Object.keys(resourceMap)"
                                :key="method"
                                :label="method"
                                :value="method"
                            />
                        </el-select>
                    </template>
                </el-table-column>

                <el-table-column label="请求路径" align="center">
                    <template slot-scope="scope">
                        <span v-if="scope.row.method.length < 1">请先选择请求方式</span>
                        <el-select v-else v-model="scope.row.path" placeholder="请选择">
                            <el-option
                                v-for="path in resourceMap[scope.row.method]"
                                :key="scope.row.method + path"
                                :label="path"
                                :value="path"
                            />
                        </el-select>
                    </template>
                </el-table-column>

                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" size="small" @click="handleDeleteResource(scope.$index)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogs.action.visible = false">取 消</el-button>
                <el-button v-if="dialogs.action.type === main.types.create" @click="handleCreateAction">
                    提 交
                </el-button>
                <el-button v-if="dialogs.action.type === main.types.update" @click="handleUpdateAction">
                    保 存
                </el-button>
            </span>
        </el-dialog>
    </el-drawer>
</template>

<script>
import {RouteListApi} from '@/api/public'
import {MenuActionListApi, MenuActionUpdateApi} from '@/api/menu'

export default {
    name: 'MenuAction',
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        direction: {
            type: String,
            default: 'rtl'
        },
        menu: {
            type: Object,
            default: null
        }
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

            dialogs: {
                action: {
                    // When dialog type is update, index is the index of actions
                    index: 0,

                    type: 0,
                    visible: false
                }
            },

            refs: {
                action: {
                    form: 'action.form'
                }
            },

            forms: {
                action: {
                    code: '',
                    name: '',
                    resources: []
                },
                rules: {
                    action: {
                        code: [
                            { required: true, trigger: 'blur', message: '请输入动作编号' }
                        ],
                        name: [
                            { required: true, trigger: 'blur', message: '请输入动作名称' }
                        ]
                    }
                }
            },

            action: {
                items: []
            },
            route: {
                items: []
            }
        }
    },
    computed: {
        isVisible: {
            get: function() {
                return this.visible
            },

            set: function() {
                this.handleClose()
            }
        },
        // {method: [path]}
        resourceMap() {
            const m = {}
            this.route.items.forEach(item => {
                if (item.method in m) {
                    m[item.method].push(item.path)
                } else {
                    m[item.method] = [item.path]
                }
            })

            return m
        }
    },
    watch: {
        isVisible(val) {
            if (val && this.menu && this.menu.id) {
                this.getMenuActionList()
            }
        }
    },
    created() {
        this.getRouteList()
    },
    methods: {
        getRouteList() {
            RouteListApi().then(response => {
                this.route.items = response.data
            })
        },
        getMenuActionList() {
            MenuActionListApi(this.menu.id).then(response => {
                this.action.items = response.data || []
            })
        },
        resetActionForm() {
            this.$nextTick(() => {
                this.$set(this.forms, 'action', {
                    code: '',
                    name: '',
                    resources: []
                })

                this.$refs[this.refs.action.form].resetFields()
            })
        },
        checkActionForm() {
            let ok = false

            this.$refs[this.refs.action.form].validate(valid => {
                if (!valid) {
                    return this.$message({ message: '表单填写不完整，请确认', type: 'error' })
                }

                // check actions
                let actions = this.$_.cloneDeep(this.action.items)
                if (this.dialogs.action.type === this.main.types.update) {
                    let action = this.action.items[this.dialogs.action.index]

                    actions = actions.filter(i => { return i.id !== action.id })
                }

                if (actions.map(item => { return item.code }).includes(this.forms.action.code)) {
                    return this.$message({ message: `动作编号[${this.forms.action.name}]已存在，请确认`, type: 'error' })
                }

                if (actions.map(item => { return item.name }).includes(this.forms.action.name)) {
                    return this.$message({ message: `动作名称[${this.forms.action.name}]已存在，请确认`, type: 'error' })
                }

                // check resources
                let keys = this.forms.action.resources.map(i => { return i.method + i.path })
                for (const [index, resource] of this.forms.action.resources.entries()) {
                    let key = resource.method + resource.path
                    if (this.$_.filter(keys, k => { if (k === key) return k }).length > 1) {
                        return this.$message({ message: `资源[${index + 1}]重复，请确认`, type: 'error' })
                    }

                    if (resource.method == '' || resource.path == '') {
                        return this.$message({ message: `资源[${index + 1}]填写不完整，请确认`, type: 'error' })
                    }
                }

                ok = true
            })

            return ok
        },
        handleClose() {
            this.$emit('close')
        },
        handleCleanActions() {
            this.action.items = []
        },
        handlePreCreateAction() {
            this.dialogs.action.type = this.main.types.create
            this.dialogs.action.visible = true

            this.resetActionForm()

        },
        handleCreateAction() {
            if (this.checkActionForm()) {
                this.action.items.push(this.forms.action)
                this.dialogs.action.visible = false
            }
        },
        handleUpdateActions() {
            this.main.loading = true
            MenuActionUpdateApi(this.menu.id, this.action.items).then(() => {
                this.$message({ message: '动作关联成功', type: 'success' })

                this.main.loading = false
                this.handleClose()
            }).catch(() => {
                this.$message({ message: '动作关联失败，请联系管理员', type: 'error' })
                this.main.loading = false
            })
        },
        handlePreUpdateAction(index) {
            let action = this.$_.cloneDeep(this.action.items[index])
            action.resources = action.resources || []

            this.$set(this.forms, 'action', action)

            this.dialogs.action.type = this.main.types.update
            this.dialogs.action.index = index
            this.dialogs.action.visible = true

        },
        handleUpdateAction() {
            if (this.checkActionForm()) {
                let action = this.$_.cloneDeep(this.forms.action)
                this.$set(this.action.items, this.dialogs.action.index, action)

                this.dialogs.action.visible = false
            }
        },
        handleDeleteAction(index) {
            this.action.items.splice(index, 1)
        },
        handleCreateActionResource() {
            this.forms.action.resources.push({
                method: '',
                path: ''
            })
        },
        handleDeleteResource(index) {
            this.forms.action.resources.splice(index, 1)
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
    &_action {
        padding: 10px 15px;
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
