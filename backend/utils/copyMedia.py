from .col import Col
import os
import shutil


def copyDirectoryRecursive(srcDir, dstDir):
    """ shutil.copytree that overwrites existing contents"""
    if not os.path.exists(dstDir):
        os.mkdir(dstDir)

    for name in os.listdir(srcDir):
        if name.startswith('.'):
            continue
        srcPath = os.path.join(srcDir, name)
        dstPath = os.path.join(dstDir, name)
        if os.path.isdir(srcPath):
            copyDirectoryRecursive(srcPath, dstPath)
        else:
            shutil.copy(srcPath, dstPath)


def copyAllMedia():
    with Col() as col:
        mediaDir = os.path.join(col.media.dir(), '_kian')
        srcDir = os.path.join(os.path.dirname(__file__), '../../media/')
        copyDirectoryRecursive(srcDir, mediaDir)
