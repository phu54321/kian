interface ToolbarEntry {
  to: string
  icon: string
  title: string
}

const toolbarList: ToolbarEntry[] = []

export function MainToolbarAdd (routerTo: string, toolbarTitle: string, toolbarIcon: string) {
  toolbarList.push({
    to: routerTo,
    icon: toolbarIcon,
    title: toolbarTitle
  })
}

export default toolbarList
