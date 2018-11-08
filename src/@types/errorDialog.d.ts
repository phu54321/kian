import Vue from 'vue'

declare module 'vue/types/vue' {
  interface Vue {
    $errorDialog: (title: string, msg: string) => void
  }
}
