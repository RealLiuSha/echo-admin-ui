import http from '@/utils/http'

export function UserListApi(params) {
    return http.get('/users', {params: params})
}

export function UserCreateApi(data) {
    return http.post('/users', data)
}

export function UserUpdateApi(id, data) {
    return http.put(`/users/${id}`, data)
}

export function UserDeleteApi(id) {
    return http.delete(`/users/${id}`)
}
