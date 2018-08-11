from col import Col

from . import emit
from .dispatchTable import registerApi


@registerApi('model_list')
def getModelList(msg):
    with Col() as col:
        return emit.emitResult(col.models.allNames())
