
const toolbarList = []

export function MainToolbarAdd (routerTo, toolbarTitle, toolbarIcon) {
  toolbarList.push({
    to: routerTo,
    icon: toolbarIcon,
    title: toolbarTitle
  })
}

export default toolbarList
