// Code from https://gist.github.com/hackwaly/b408c5a5f2422845d33ea16f120c8de0

export default function asyncData (loadData) {
    let data = null;
    return {
        created () {
            if(data) Object.assign(this.$data, data);
        },
        async beforeRouteEnter (to, from, next) {
            data = await loadData(to);
            next(vm => {
                Object.assign(vm.$data, data);
            });
        },
        async beforeRouteUpdate (to, from, next) {
            data = await loadData(to);
            Object.assign(this.$data, data);
            next();
        },
    };
}
