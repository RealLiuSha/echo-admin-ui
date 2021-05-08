import http from '@/utils/http'

export function MenuListApi(params) {
    return http.get('/menus', {params: params})
}

export function MenuCreateApi(data) {
    return http.post('/menus', data)
}

export function MenuUpdateApi(id, data) {
    return http.put(`/menus/${id}`, data)
}

export function MenuDeleteApi(id) {
    return http.delete(`/menus/${id}`)
}

export function MenuActionListApi(id) {
    return http.get(`/menus/${id}/actions`)
}

export function MenuActionUpdateApi(id, data) {
    return http.put(`/menus/${id}/actions`, data)
}
