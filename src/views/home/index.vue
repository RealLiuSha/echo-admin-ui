<template>
    <div class="app-container" :loading="loadings.main">
        Dashboard
    </div>
</template>

<script>

export default {
    name: 'Dashboard',
    data() {
        return {
            loadings: {
                main: false
            },

            dialogs: {
            },

            refs: {
                forms: {
                }
            },

            forms: {

                rules: {
                }
            },

            model: {
                params: {
                },

                items: [],
                total: 0
            }
        }
    },
    created() {
    },
    methods: {
    }
}
</script>

