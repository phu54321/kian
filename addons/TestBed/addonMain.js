import MainRouter from '~/router';
import MainToolbar from '~/toolbar';
import TestBedVue from './TestBed';

export default {
    install () {
        MainRouter.add('/testbed', TestBedVue);
        MainToolbar.add('/testbed', 'Testbed', 'flask');
    },
};
