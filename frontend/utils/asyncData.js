import ErrorDialog from '../components/ErrorDialog';

export default function asyncData (loadData) {
    return {
        // this prevents beforeRouteEnter and created from both manipulating the data.
        props: ['$asyncDataTrap'],
        mounted () {
            if (this.$route.params.$asyncDataTrap) {
                this.$route.params.$asyncDataTrap = false;
                return;
            }
            loadData(this).then(d => {
                Object.assign(this.$data, d);
            });
        },
        beforeRouteEnter (to, from, next) {
            loadData(to.params).then(data => {
                to.params.$asyncDataTrap = true;
                next(vm => {
                    Object.assign(vm.$data, data);
                });
            }).catch(err => {
                ErrorDialog.openErrorDialog(null, err.message);
                next(false);
            });
        },  
        beforeRouteUpdate (to, from, next) {
            loadData(to.params).then(data => {
                Object.assign(this.$data, data);
                next();
            }).catch(err => {
                ErrorDialog.openErrorDialog(null, err.message);
                next(false);
            });
        },
    };
}
