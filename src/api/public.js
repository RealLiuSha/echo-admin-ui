import http from '@/utils/http'

export function UserLoginApi(data) {
    return http.post('/publics/user/login', data)
}

export function UserLogoutApi() {
    return http.post('/publics/user/logout')
}

export function UserMenuTreeApi() {
    return http.get('/publics/user/menutree')
}

export function CaptchaApi() {
    return http.get('/publics/captcha')
}

export function RouteListApi() {
    return http.get('/publics/sys/routes')
}
