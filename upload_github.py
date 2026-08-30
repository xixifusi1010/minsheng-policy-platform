import os, base64, json, urllib.request, urllib.parse, subprocess, sys

TOKEN = os.environ['GH_TOKEN']
OWNER = 'xixifusi1010'
REPO = 'minsheng-policy-platform'
API = 'https://api.github.com'
MAX_BYTES = 900 * 1024  # Contents API 单文件软上限，超过则跳过并提示

def api(method, path, data=None):
    url = API + path
    headers = {
        'Authorization': 'Bearer ' + TOKEN,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'upload-script',
    }
    body = None
    if data is not None:
        body = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            raw = r.read()
        return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        msg = e.read().decode('utf-8', 'replace')
        print(f'  [HTTP {e.code}] {method} {path}: {msg[:200]}', file=sys.stderr)
        raise

# --- 取文件清单 (优先 git ls-files，否则用 os.walk) ---
SKIP_DIRS = {'.git', 'node_modules', 'dist', '.workbuddy', 'assets'}
SKIP_FILES = set()
def list_files():
    try:
        out = subprocess.check_output(['git', 'ls-files'], cwd=os.getcwd()).decode('utf-8', 'replace')
        fs = [f for f in out.splitlines() if f and not f.startswith('assets/')]
        if fs:
            return fs
    except Exception:
        pass
    res = []
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith('.')]
        for fn in files:
            full = os.path.join(root, fn).replace('\\', '/')
            full = full[2:] if full.startswith('./') else full
            if full.startswith('assets/') or full in SKIP_FILES:
                continue
            res.append(full)
    return res

files = list_files()
print(f'=== 待上传文件数: {len(files)} (已排除 assets/) ===')

def read_b64(path):
    with open(path, 'rb') as f:
        return base64.b64encode(f.read()).decode('ascii')

# --- 引导分支: 先传 README (不指定 branch) ---
readme = 'README.md' if 'README.md' in files else files[0]
print(f'--- bootstrap 分支: {readme} ---')
api('PUT', f'/repos/{OWNER}/{REPO}/contents/{urllib.parse.quote(readme)}',
    {'message': f'init: add {readme}', 'content': read_b64(readme)})

# --- 逐个上传其余文件 (指定 branch=main) ---
ok, skipped = 0, 0
for f in files:
    if f == readme:
        continue
    try:
        sz = os.path.getsize(f)
    except OSError:
        skipped += 1
        print(f'  SKIP (不可读) {f}')
        continue
    if sz > MAX_BYTES:
        skipped += 1
        print(f'  SKIP (>900KB) {f} ({sz} bytes)')
        continue
    try:
        api('PUT', f'/repos/{OWNER}/{REPO}/contents/{urllib.parse.quote(f)}',
            {'message': f'add {f}', 'content': read_b64(f), 'branch': 'main'})
        ok += 1
        if ok % 20 == 0:
            print(f'  ...已上传 {ok} 个')
    except Exception:
        skipped += 1
        print(f'  FAIL {f}')

print(f'=== 完成: 成功 {ok} 个, 跳过 {skipped} 个 ===')

# --- 核对远端文件数 ---
try:
    tree = api('GET', f'/repos/{OWNER}/{REPO}/git/trees/main?recursive=1')
    cnt = len(tree.get('tree', []))
    print(f'=== 远端 main 分支文件/目录节点数: {cnt} ===')
except Exception as e:
    print('核对远端失败(非致命):', e)
