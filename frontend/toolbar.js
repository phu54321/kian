const toolbarList = [];

export default {
    add (routerTo, toolbarTitle, toolbarIcon) {
        toolbarList.push({
            to: routerTo,
            icon: toolbarIcon,
            title: toolbarTitle,
        });
    },
    list () {
        return toolbarList;
    },
};
