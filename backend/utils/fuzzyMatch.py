import hgtk


def fuzzyMatch(needle, hasystack):
    needle = hgtk.text.decompose(needle).lower()
    hasystack = hgtk.text.decompose(hasystack).lower()

    try:
        idx = 0
        for ch in needle:
            while True:
                if hasystack[idx] == ch:
                    break
                idx += 1
            idx += 1
        return True
    except IndexError:
        return False
