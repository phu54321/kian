from .col import Col
import os
import shutil


def copyDirectoryRecursive(srcDir, dstDir):
    """ copy all contenst of srcDir and its subdirectory to dstDir.

    Directory structure is flattened. """
    for name in os.listdir(srcDir):
        if name.startswith('.'):
            continue
        srcPath = os.path.join(srcDir, name)
        if os.path.isdir(srcPath):
            copyDirectoryRecursive(srcPath, dstDir)
        else:
            dstPath = os.path.join(dstDir, name)
            shutil.copy(srcPath, dstPath)


def copyAllMedia():
    with Col() as col:
        srcDir = os.path.join(os.path.dirname(__file__), '../../media/')
        copyDirectoryRecursive(srcDir, col.media.dir())
