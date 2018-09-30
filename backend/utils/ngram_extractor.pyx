# distutils: language = c++

cimport cython


def ngramExtract(str string):
    cdef bytearray s = bytearray(string.lower().encode('utf-8'))
    cdef unsigned char* view = s
    cdef unsigned char *p = view
    cdef unsigned char *end = view + len(view)
    cdef unsigned char* ngramStartPointer[10]
    cdef unsigned char ch

    cdef int ngramSegmentCount = 1
    cdef bint inSegment = False
    cdef list ret = []
    cdef int i

    ngramStartPointer[0] = p

    while p < end:
        ch = p[0]
        if ord('a') <= ch <= ord('z') or ord('0') <= ch <= ord('9'):
            inSegment = True
        elif inSegment:
            inSegment = False

            for ngramIndex in range(ngramSegmentCount):
                ngramLength = p - ngramStartPointer[ngramIndex]
                if ngramLength >= 4:
                    ret.append(
                        ngramStartPointer[ngramIndex][:ngramLength]
                    )

            if ch == ord(' ') or ch == ord('-'):
                if ngramSegmentCount == 10:
                    for i in range(1, 10):
                        ngramStartPointer[i - 1] = ngramStartPointer[i]
                if ngramSegmentCount < 10:
                    ngramStartPointer[ngramSegmentCount] = p + 1
                    ngramSegmentCount += 1
            else:
                ngramSegmentCount = 1
                ngramStartPointer[0] = p + 1

        else:
            ngramSegmentCount = 1
            ngramStartPointer[0] = p + 1

        p += 1

    inSegment = False

    for ngramIndex in range(ngramSegmentCount):
        ngramLength = p - ngramStartPointer[ngramIndex]
        ret.append(ngramStartPointer[ngramIndex][:ngramLength])

    return ret
