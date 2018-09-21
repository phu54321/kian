cimport cython

def preprocess(string):
    return string.lower().encode('utf-8')


def preprocessList(l):
    return list(map(preprocess, l))


def fast_fuzzymatchBatch(
    const unsigned char[] preprocessedNeedle,
    list preprocessedHaystackList
):
    cdef list ret = []
    cdef bytes haystack

    for haystack in preprocessedHaystackList:
        if fast_fuzzymatch(preprocessedNeedle, haystack):
            ret.append(haystack.decode('utf-8'))
    return ret


@cython.boundscheck(False)
@cython.wraparound(False)
cpdef bint fast_fuzzymatch(const unsigned char[] needle, const unsigned char[] haystack):
    cdef int haystackIndex = len(haystack) - 1
    cdef int needleIndex = len(needle) - 1
    cdef unsigned char ch

    while needleIndex >= 0:
        ch = needle[needleIndex]
        while True:
            if haystack[haystackIndex] == ch:
                break
            haystackIndex -= 1
            if haystackIndex == -1:
                return False
        haystackIndex -= 1
        needleIndex -= 1
        if haystackIndex == -1:
            return False

    return True
