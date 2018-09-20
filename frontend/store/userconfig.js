import ankiCall from '~/api/ankiCall';

const state = {
    loaded: false,
    config: null,
};

const actions = {
    async loadUserConfig ({ commit, state }) {
        // Config already loaded. Use cached value
        if(state.loaded) return;

        commit('userconfig_loading');
        const config = await ankiCall('config_get');
        commit('userconfig_loaded', config);
    },
};

const mutations = {
    userconfig_loading (state) {
        state.loaded = false;
    },
    userconfig_loaded (state, config) {
        state.loaded = true;
        state.config = config;
    },
};

const getters = {
    userConfig (state) {
        return state.loaded ? state.config : undefined;
    },
};

export default {
    state,
    actions,
    mutations,
    getters,
};