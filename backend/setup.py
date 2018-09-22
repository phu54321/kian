from distutils.core import setup
from Cython.Build import cythonize

setup(
    ext_modules = cythonize([
        # "utils/fast_fuzzymatch.pyx",
        "utils/ngram_extractor.pyx",
    ])
)
