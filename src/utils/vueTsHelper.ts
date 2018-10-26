import Vue from 'vue'
import VueRouter, { Route } from 'vue-router'
import { Toasted } from 'vue-toasted'

export default class KianVue extends Vue {
  $router!: VueRouter
  $route!: Route
  $toasted!: Toasted
  $loading: any
}
