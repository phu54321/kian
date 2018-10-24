import {
  getAnkiConfig,
  setCurrentDeck,
  setCurrentModel
} from '@/api'
import { Module } from 'vuex'

const userConfigModule: Module<UserConfigState, RootState> = {
  state: {
    loaded: false,
    config: null
  },
  actions: {
    async loadUserConfig ({ commit, state }) {
      // Config already loaded. Use cached value
      if (state.loaded) return

      commit('userconfig_loading')
      const config = await getAnkiConfig()
      commit('userconfig_loaded', config)
    },
    async setCurrentDeck ({ commit, dispatch, state }, newDeck) {
      await dispatch('loadUserConfig')
      if (state.config.currentDeck === newDeck) return
      await setCurrentDeck(newDeck)
      commit('userconfig_setCurrentDeck', newDeck)
    },
    async setCurrentModel ({ commit, dispatch, state }, newModel) {
      await dispatch('loadUserConfig')
      if (state.config.currentModel === newModel) return
      await setCurrentModel(newModel)
      commit('userconfig_setCurrentModel', newModel)
    }
  },
  mutations: {
    userconfig_loading (state) {
      state.loaded = false
    },
    userconfig_loaded (state, config) {
      state.loaded = true
      state.config = config
    },
    userconfig_setCurrentDeck (state, currentDeck) {
      state.config.currentDeck = currentDeck
    },
    userconfig_setCurrentModel (state, currentModel) {
      state.config.currentModel = currentModel
    }
  },
  getters: {
    userConfig (state) {
      return state.loaded ? state.config : undefined
    }
  }
}

export default userConfigModule
