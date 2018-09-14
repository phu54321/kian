import MainRouter from '~/router';
import MainToolbar from '~/toolbar';
import JokboRead from './JokboRead';

MainRouter.add('/jbread', JokboRead);
MainToolbar.add('/jbread', 'Jokbo', 'book');
