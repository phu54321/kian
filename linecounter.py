import os

totlinen = 0
totsize = 0

for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or 'summernote' in root:
        continue

    for f in files:
        if f in ('.eslintrc.js', 'poi.config.js'):
            continue

        ext = os.path.splitext(f)[1]

        if ext.lower() in ('.vue', '.js'):
            finalpath = os.path.join(root, f)
            code = open(finalpath, 'r', encoding='utf-8').read()
            totsize += len(code)
            linen = code.count('\n') + 1
            print("%-40s : %4d" % (finalpath, linen))
            totlinen += linen

print('Total lines: %d' % totlinen)
print('Total size: %d' % totsize)
