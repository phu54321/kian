def emitResult(res):
    """ Emit non-error result. """
    return {
        'error': None,
        'result': res
    }


def emitError(errmsg):
    """ Emit error message. """
    return {
        'error': errmsg,
    }
