<template>
    <div>
        <div class="bg-banner" />
        <div id="login-box">
            <div class="login-banner" />
            <el-form :ref="refs.login" :model="forms.login" :rules="rules.login" class="login-form" auto-complete="on" label-position="left">
                <div class="title-container">
                    <h3 class="title">{{ title }} 管理后台</h3>
                </div>
                <div>
                    <el-form-item prop="username">
                        <el-input ref="name" v-model="forms.login.username" placeholder="用户名" type="text" tabindex="1" auto-complete="on">
                            <svg-icon slot="prefix" name="user" />
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input ref="password" v-model="forms.login.password" :type="passwordType" placeholder="密码" tabindex="2" auto-complete="on">
                            <svg-icon slot="prefix" name="password" />
                            <svg-icon slot="suffix" :name="passwordType === 'password' ? 'eye' : 'eye-open'" @click="showPassword" />
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="captcha_code" style="position: relative;">
                        <el-input ref="captcha_code" v-model="forms.login.captcha_code" placeholder="请输入验证码" style="width: 60%;" @keyup.enter.native="handleUserLogin" />
                        <div class="captcha">
                            <img v-if="forms.loginExt.captcha_blob" :src="forms.loginExt.captcha_blob" width="100%" height="100%" alt="请输入验证码" @click="handleGetCaptcha">
                        </div>
                    </el-form-item>
                </div>
                <el-checkbox v-model="forms.loginExt.remember">记住我</el-checkbox>
                <el-button :loading="loading" type="primary" style="width: 100%;" @click.native.prevent="handleUserLogin">
                    登 录
                </el-button>
            </el-form>
        </div>
        <Copyright v-if="$store.state.settings.showCopyright" />
    </div>
</template>

<script>
import {CaptchaApi} from '@/api/public'

export default {
    name: 'Login',
    data() {
        return {
            title: process.env.VUE_APP_TITLE,
            forms: {
                login: {
                    username: localStorage.login_username || '',
                    password: '',
                    captcha_id: '',
                    captcha_code: ''
                },
                loginExt: {
                    captcha_blob: '',
                    remember: !!localStorage.login_username
                }
            },
            refs: {
                login: 'login'
            },
            rules: {
                login: {
                    username: [
                        { required: true, trigger: 'blur', message: '请输入用户名' }
                    ],
                    password: [
                        { required: true, trigger: 'blur', message: '请输入密码' },
                        { min: 6, max: 18, trigger: 'blur', message: '密码长度为6到18位' }
                    ],
                    captcha_code: [
                        { required: true, trigger: 'blur', message: '请输入验证码' }
                    ]
                }
            },
            loading: false,
            passwordType: 'password',
            redirect: undefined
        }
    },
    watch: {
        $route: {
            handler: function(route) {
                this.redirect = route.query && route.query.redirect
            },
            immediate: true
        }
    },
    created() {
        this.getCaptcha()
    },
    methods: {
        showPassword() {
            this.passwordType = this.passwordType === 'password' ? '' : 'password'
            this.$nextTick(() => {
                this.$refs.password.focus()
            })
        },
        getCaptcha() {
            CaptchaApi().then(res => {
                const {blob, id} = res.data
                this.forms.login.captcha_id = id
                this.forms.loginExt.captcha_blob = blob
            })
        },
        handleGetCaptcha() {
            this.getCaptcha()
        },
        handleUserLogin() {
            this.$refs[this.refs.login].validate(valid => {
                if (valid) {
                    this.loading = true
                    this.$store.dispatch('user/login', this.forms.login).then(() => {
                        this.loading = false
                        if (this.forms.loginExt.remember) {
                            localStorage.setItem('login_username', this.forms.login.username)
                        }

                        if (this.redirect) {
                            this.$router.push({ path: this.redirect })
                        } else if (this.$store.getters['menu/sidebarRoutes'].length > 0) {
                            this.$router.push({
                                name: this.$store.getters['menu/sidebarRoutes'][0].name,
                                replace: true
                            })
                        } else {
                            this.$router.push({ path: '/' })
                        }
                    }).catch(() => {
                        this.getCaptcha()
                        this.loading = false
                    })
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
[data-mode=mobile] {
    #login-box {
        max-width: 80%;
        .login-banner {
            display: none;
        }
    }
}
::v-deep input[type=password]::-ms-reveal {
    display: none;
}
.bg-banner {
    position: absolute;
    z-index: 0;
    width: 100%;
    height: 100%;
    background-image: url(../assets/images/login-bg.png);
    background-size: cover;
    background-position: center center;
}
.captcha {
    width: 33%;
    height: 38px;
    float: right !important;
    background: #ccc;
    img {
        cursor: pointer;
        vertical-align: middle;
    }
}
#login-box {
    display: flex;
    justify-content: space-between;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 0 5px #999;
    .login-banner {
        background: url(../assets/images/login-banner-left.png) no-repeat 0;
        background-size: 240px;
        width: 300px;
        background-position: center center;
    }
    .login-form {
        width: 450px;
        padding: 50px 35px 30px;
        overflow: hidden;
        .svg-icon {
            vertical-align: -0.35em;
        }
        .title-container {
            position: relative;
            .title {
                font-size: 22px;
                color: #666;
                margin: 0 auto 30px;
                text-align: center;
                font-weight: bold;
                @include text-overflow;
            }
        }
    }
    ::v-deep .el-input {
        display: inline-block;
        height: 40px;
        width: 100%;
        input {
            height: 40px;
        }
        .el-input__prefix {
            left: 10px;
        }
        .el-input__suffix {
            right: 10px;
        }
    }
    .el-checkbox {
        margin: 20px 0;
    }
}
.copyright {
    position: absolute;
    bottom: 30px;
    width: 100%;
    margin: 0;
    mix-blend-mode: difference;
}
</style>
