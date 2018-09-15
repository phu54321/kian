import MainRouter from '~/router';
import MainToolbar from '~/toolbar';
import JokboRead from './JokboRead';

export default {
    install () {
        MainRouter.add('/jbread', JokboRead);
        MainToolbar.add('/jbread', 'Jokbo', 'book');        
    }
};
