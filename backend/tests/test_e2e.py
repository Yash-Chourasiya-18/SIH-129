import urllib.request
import json

BASE = 'http://localhost:8000'

def login(u, p):
    data = json.dumps({'username': u, 'password': p}).encode()
    req = urllib.request.Request(BASE + '/api/auth/login', data=data, headers={'Content-Type': 'application/json'})
    return json.loads(urllib.request.urlopen(req).read())['access_token']

def verify(token, cid):
    data = json.dumps({'citizen_id': cid}).encode()
    req = urllib.request.Request(BASE + '/api/services/scholarship/verify', data=data,
                                  headers={'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token})
    return json.loads(urllib.request.urlopen(req).read())

test_cases = [
    ('rahul.sharma',    'MH1001', 'ELIGIBLE'),
    ('priya.patil',     'MH1002', 'NOT_ELIGIBLE'),
    ('sneha.kulkarni',  'MH1004', 'NOT_ELIGIBLE'),
    ('rohan.jadhav',    'MH1005', 'ELIGIBLE'),
    ('meera.joshi',     'MH1006', 'ELIGIBLE'),
    ('kiran.shinde',    'MH1007', 'NOT_ELIGIBLE'),
]

print('=== Multi-Citizen Eligibility Test ===')
all_pass = True
for username, cid, expected in test_cases:
    token = login(username, 'citizen123')
    res = verify(token, cid)
    actual = res['eligibility_result']
    ok = 'PASS' if actual == expected else 'FAIL'
    if ok == 'FAIL':
        all_pass = False
    reasons = res.get('eligibility', {}).get('reasons', [])
    print(f'  [{ok}] {cid}: Expected={expected}, Got={actual}')
    if reasons:
        print(f'         Reasons: {reasons[0]}')

print()
print('All tests passed!' if all_pass else 'Some tests FAILED!')

admin_token = login('admin', 'admin123')
req = urllib.request.Request(BASE + '/api/admin/audit-logs?per_page=8',
                              headers={'Authorization': 'Bearer ' + admin_token})
logs = json.loads(urllib.request.urlopen(req).read())
print('\n=== Recent Audit Logs ===')
for l in logs[:6]:
    dept = (l['department'] or '')[:24].ljust(24)
    status = (l['status'] or '').ljust(10)
    purpose = (l['purpose'] or '')[:40]
    print(f'  {dept} | {status} | {purpose}')

req2 = urllib.request.Request(BASE + '/api/admin/system-status',
                               headers={'Authorization': 'Bearer ' + admin_token})
systems = json.loads(urllib.request.urlopen(req2).read())
print('\n=== System Status ===')
for s in systems:
    name = (s['department_name'] or '')[:24].ljust(24)
    status = (s['status'] or '').ljust(8)
    print(f'  {name} | {status} | Requests: {s["total_requests"]} | Success: {s["successful_requests"]}')
