def typeCheck(obj, typeDef):
    for k, v in typeDef.items():
        if isinstance(v, type):
            if not isinstance(obj[k], v):
                raise TypeError
        elif isinstance(v, dict):
            typeCheck(obj[k], v)

