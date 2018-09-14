import MainRouter from '~/router';
import MainToolbar from '~/toolbar';
import TestBedVue from './TestBed';

MainRouter.add('/testbed', TestBedVue);
MainToolbar.add('/testbed', 'Testbed', 'flask');
