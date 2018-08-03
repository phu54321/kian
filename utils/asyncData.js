export default function asyncData (loadData) {
    return {
        // this prevents beforeRouteEnter and created from both manipulating the data.
        props: ['$asyncDataTrap'],
        created () {
            if (this.$route.params.$asyncDataTrap) {
                this.$route.params.$asyncDataTrap = false;
                return;
            }
            loadData(this).then(d => {
                Object.assign(this.$data, d);
            });
        },
        async beforeRouteEnter (to, from, next) {
            to.params.$asyncDataTrap = true;
            const data = await loadData(to.params);
            next(vm => {
                Object.assign(vm.$data, data);
            });
        },
        async beforeRouteUpdate (to, from, next) {
            const data = await loadData(to.params);
            Object.assign(this.$data, data);
            next();
        },
    };
}
