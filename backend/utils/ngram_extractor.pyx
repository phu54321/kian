# distutils: language = c++

cimport cython


def ngramExtract(str string):
    cdef bytes s = string.lower().encode('utf-8')
    cdef const unsigned char* view = s
    cdef const unsigned char *p = view
    cdef const unsigned char *end = view + len(view)
    cdef const unsigned char* ngramStartPointer[10]
    cdef unsigned char ch

    cdef int ngramSegmentCount = 1
    cdef bint inSegment = False
    cdef list ret = []
    cdef int i

    ngramStartPointer[0] = p
    ngramStartPointer[1] = p
    ngramStartPointer[2] = p
    ngramStartPointer[3] = p
    ngramStartPointer[4] = p
    ngramStartPointer[5] = p
    ngramStartPointer[6] = p
    ngramStartPointer[7] = p
    ngramStartPointer[8] = p
    ngramStartPointer[9] = p

    while p < end:
        ch = p[0]
        if ord('a') <= ch <= ord('z') or ord('0') <= ch <= ord('9'):
            inSegment = True
        elif ch == ord(' ') and inSegment:
            inSegment = False

            for ngramIndex in range(ngramSegmentCount):
                ngramLength = p - ngramStartPointer[ngramIndex]
                if ngramLength >= 4:
                    ret.append(
                        ngramStartPointer[ngramIndex][:ngramLength]
                    )

            if ngramSegmentCount == 10:
                for i in range(1, 10):
                    ngramStartPointer[i - 1] = ngramStartPointer[i]
            if ngramSegmentCount < 10:
                ngramStartPointer[ngramSegmentCount] = p + 1
                ngramSegmentCount += 1

        else:
            ngramSegmentCount = 1
            ngramStartPointer[0] = p + 1

        p += 1

    inSegment = False

    for ngramIndex in range(ngramSegmentCount):
        ngramLength = p - ngramStartPointer[ngramIndex]
        ret.append(ngramStartPointer[ngramIndex][:ngramLength])

    return ret

