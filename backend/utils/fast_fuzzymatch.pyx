cimport cython

def preprocess(string):
    return string.lower().encode('utf-8')


def preprocessList(l):
    return [preprocess(s) for s in l]


def fast_fuzzymatchBatch(
    const unsigned char[] preprocessedNeedle,
    list preprocessedHaystackList
):
    cdef list ret = []
    cdef bytes haystack
    cdef int rank

    for haystack in preprocessedHaystackList:
        rank = fast_fuzzymatch(preprocessedNeedle, haystack)
        if rank:
            ret.append([rank, haystack.decode('utf-8')])

    ret.sort(key=lambda x: -x[0])
    return [r[1] for r in ret]


# Fuzzy search algorithm from
# https://github.com/phu54321/TrigEditPlus/blob/master/TrigEditPlus/Editor/SetAutocomplete.cpp

@cython.boundscheck(False)
@cython.wraparound(False)
cpdef int fast_fuzzymatch(const unsigned char[] needle, const unsigned char[] haystack):
    cdef int max_prioritized_char_dist = 3
    cdef int max_prioritized_wordstart_dist = 4

    cdef int haystackLen = len(haystack)
    cdef int needleLen = len(needle)
    cdef int haystackIndex = 0
    cdef int needleIndex = 0
    cdef int prevHaystackIndex

    cdef int chdist, chd_mul, wsd_mul
    cdef int rank = 0
    cdef unsigned char ch

    cdef int wsIndex, wsDist

    while needleIndex < needleLen:
        if haystackIndex == haystackLen:
            return 0

        ch = needle[needleIndex]
        prevHaystackIndex = haystackIndex

        while haystack[haystackIndex] != ch:
            haystackIndex += 1
            if haystackIndex == haystackLen:
                return 0

        chdist = haystackIndex - prevHaystackIndex
        chd_mul = max(1, max_prioritized_char_dist - chdist)

        wsIndex = haystackIndex
        while wsIndex >= 0:
            wsi_ch = haystack[wsIndex]
            if wsi_ch == 32:  # space
                wsIndex += 1
                break
            elif 97 <= wsi_ch <= 122:  # a-z
                break
            wsIndex -= 1

        wsDist = haystackIndex - wsIndex
        wsd_mul = max(1, max_prioritized_wordstart_dist - wsDist)

        rank += 100 * chd_mul * wsd_mul
        haystackIndex += 1
        needleIndex += 1

    if haystackLen < 100:
        rank += 100 - haystackLen

    return rank
