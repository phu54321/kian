# -*- mode: python -*-


block_cipher = None


a = Analysis(['backend\\server.py'],
             pathex=['C:\\gitclones\\kian'],
             binaries=[],
             datas=[],
             hiddenimports=[
                 'socketio',
                 'engineio',
                 'engineio.async_aiohttp',
                 'aiohttp',
             ],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher)
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          exclude_binaries=True,
          name='kian',
          debug=False,
          strip=False,
          upx=False,
          console=True )
coll = COLLECT(exe,
               a.binaries,
               a.zipfiles,
               a.datas,
               strip=False,
               upx=False,
               name='server')
