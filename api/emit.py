from flask import jsonify

def emitResult(res):
    """ Emit non-error result. """
    return jsonify({
        'error': None,
        'result': res
    })


def emitError(errmsg):
    """ Emit error message. """
    return jsonify({
        'error': errmsg,
    })
