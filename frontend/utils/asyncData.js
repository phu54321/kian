import ErrorDialog from '../components/ErrorDialog';

function translateParamsToProps (to) {
    const routeMatches = to.matched;
    const params = to.params;
    const lastRoute = routeMatches[routeMatches.length - 1];
    const routeProps = lastRoute.props.default;

    if(routeProps === true) {
        const targetProps = lastRoute.components.default.props;
        const props = {};

        // Match types to target component's typing system, if possible.
        if(targetProps) {
            Object.keys(targetProps).forEach(propName => {
                const targetProp = targetProps[propName];
                const targetPropType = targetProp.type;
                if(targetPropType === null) props[propName] = params[propName];
                else props[propName] = targetPropType(params[propName]);
            });
        }
        return props;
    }
    else if(typeof routeProps === 'function') {
        return routeProps(to);
    }
}

export default function asyncData (loadData, callback) {
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
                if(callback) callback.apply(this);
            });
        },
        beforeRouteEnter (to, from, next) {
            const toProps = translateParamsToProps(to);
            loadData(toProps).then(data => {
                to.params.$asyncDataTrap = true;
                next(vm => {
                    Object.assign(vm.$data, data);
                    if(callback) callback.apply(this);
                });
            }).catch(err => {
                ErrorDialog.openErrorDialog(null, err.message);
                next(false);
            });
        },
        beforeRouteUpdate (to, from, next) {
            const toProps = translateParamsToProps(to);
            loadData(toProps).then(data => {
                Object.assign(this.$data, data);
                if(callback) callback.apply(this);
                next();
            }).catch(err => {
                ErrorDialog.openErrorDialog(null, err.message);
                next(false);
            });
        },
    };
}
