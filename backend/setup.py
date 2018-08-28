import sys
from cx_Freeze import setup, Executable

# Dependencies are automatically detected, but it might need fine tuning.
build_exe_options = {
    "packages": ["os", "asyncio", "idna"],
    "excludes": ["tkinter"],
    'build_exe': '../dist/'
}

# GUI applications require a different base on Windows (the default is for a
# console application).
base = "Console"
# if sys.platform == "win32":
#     base = "Win32GUI"

setup(  name = "Kian",
        version = "0.1",
        description = "Spaced learning program",
        options = {"build_exe": build_exe_options},
        executables = [Executable("server.py", base=base)])
