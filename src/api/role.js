import http from '@/utils/http'

export function RoleListApi(params) {
    return http.get('/roles', {params: params})
}

export function RoleCreateApi(data) {
    return http.post('/roles', data)
}

export function RoleUpdateApi(id, data) {
    return http.put(`/roles/${id}`, data)
}

export function RoleDeleteApi(id) {
    return http.delete(`/roles/${id}`)
}

export function RoleDetailApi(id) {
    return http.get(`/roles/${id}`)
}
