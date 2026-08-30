import os, base64, json, urllib.request, urllib.parse

TOKEN = os.environ['GH_TOKEN']
OWNER = 'xixifusi1010'
REPO = 'minsheng-policy-platform'
API = 'https://api.github.com'
SKIP_DIRS = {'.git', 'node_modules', 'dist', '.workbuddy', 'assets'}

def api(method, path, data=None):
    url = API + path
    headers = {'Authorization': 'Bearer ' + TOKEN, 'Accept': 'application/vnd.github+json', 'User-Agent': 'upload-script'}
    body = json.dumps(data).encode('utf-8') if data is not None else None
    if body is not None:
        headers['Content-Type'] = 'application/json'
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=180) as r:
        raw = r.read()
    return json.loads(raw) if raw else {}

# 1) 远端已有文件
remote = set()
tree = api('GET', f'/repos/{OWNER}/{REPO}/git/trees/main?recursive=1')
for t in tree.get('tree', []):
    if t['type'] == 'blob':
        remote.add(t['path'])
print(f'远端已有 {len(remote)} 个文件')

# 2) 本地文件 (os.walk 原生路径, 排除 assets 等)
local = []
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith('.')]
    for fn in files:
        full = os.path.join(root, fn).replace('\\', '/')
        full = full[2:] if full.startswith('./') else full
        if full.startswith('assets/'):
            continue
        local.append(full)
local_set = set(local)

# 3) 缺失 = 本地有 且 远端无
missing = sorted(local_set - remote)
print(f'缺失(待补传) {len(missing)} 个:')
for m in missing:
    print('   ', m)

# 4) 补传 (用 os.walk 原生路径打开, 规避中文路径问题)
ok = 0
for f in missing:
    try:
        with open(f, 'rb') as fh:
            b64 = base64.b64encode(fh.read()).decode('ascii')
        api('PUT', f'/repos/{OWNER}/{REPO}/contents/{urllib.parse.quote(f)}',
            {'message': f'add {f}', 'content': b64, 'branch': 'main'})
        ok += 1
        print(f'  UPLOADED {f}')
    except Exception as e:
        print(f'  FAIL {f}: {e}')

print(f'=== 补传完成: 成功 {ok}/{len(missing)} ===')

# 5) 最终核对
tree2 = api('GET', f'/repos/{OWNER}/{REPO}/git/trees/main?recursive=1')
final = set(t['path'] for t in tree2.get('tree', []) if t['type'] == 'blob')
still = sorted(local_set - final)
print(f'远端最终文件数: {len(final)}')
print(f'仍缺失: {still if still else "无 (全部补齐)"}')
