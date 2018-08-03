// Code from https://gist.github.com/hackwaly/b408c5a5f2422845d33ea16f120c8de0

export default function asyncData (loadData) {
    let data;
    return {
        created () {
            if (!data) {
                throw new Error();
            }
            Object.assign(this.$data, data);
        },
        async beforeRouteEnter (to, from, next) {
            data = await loadData(to);
            next(_vm => {
                data = null;
            });
        },
        async beforeRouteUpdate (to, from, next) {
            let data = await loadData(to);
            Object.assign(this.$data, data);
            next();
        },
    };
}
