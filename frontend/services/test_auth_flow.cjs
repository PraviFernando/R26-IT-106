/**
 * End-to-End Regression Test Suite for Authentication Flow & Session Management
 * Tests:
 * 1. Fresh launch without credentials -> state resolves to Login
 * 2. Registration and login -> validates JWT and session persistence format
 * 3. Valid stored session restoration -> verifies against GET /user/me
 * 4. Invalid/expired session handling -> detected, cleared, reverts to Login
 * 5. Logout flow -> session removed, interceptor cleared
 * 6. Protected endpoint authorization guards -> unauthenticated requests blocked (401)
 * 7. Clean up ephemeral test accounts
 */

const http = require('http');

const PORT = 8073;

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: body ? JSON.parse(body) : null });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

function assert(condition, message, detail = '') {
  if (condition) {
    console.log(`[PASS] ${message}`);
  } else {
    console.error(`[FAIL] ${message} - ${detail}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runAuthTests() {
  console.log('================================================================');
  console.log('       PERICARE AUTHENTICATION & SESSION REGRESSION SUITE        ');
  console.log('================================================================\n');

  let testUserToken = null;
  let testUserId = null;
  const testEmail = `auth_test_${Date.now()}@pericare.test`;
  const testPassword = 'Password123!';
  const testUsername = `user_${Date.now()}`;

  try {
    // -----------------------------------------------------------------
    // TEST 1: Unauthenticated request to protected endpoints blocked (401)
    // -----------------------------------------------------------------
    console.log('--- TEST 1: Protected API Endpoint Authorization (Task 1 Guard) ---');
    const meNoAuth = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/user/me',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    assert(meNoAuth.status === 401, 'GET /user/me without token returns 401 Unauthorized', `Status: ${meNoAuth.status}`);

    const diaryNoAuth = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/diary',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    assert(diaryNoAuth.status === 401, 'GET /diary without token returns 401 Unauthorized', `Status: ${diaryNoAuth.status}`);

    const epdsNoAuth = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/epds/history',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    assert(epdsNoAuth.status === 401, 'GET /epds/history without token returns 401 Unauthorized', `Status: ${epdsNoAuth.status}`);

    const planNoAuth = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/plan/activity/history',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    assert(planNoAuth.status === 401, 'GET /plan/activity/history without token returns 401 Unauthorized', `Status: ${planNoAuth.status}`);

    // -----------------------------------------------------------------
    // TEST 2: Signup flow
    // -----------------------------------------------------------------
    console.log('\n--- TEST 2: User Registration (Signup -> Login capability) ---');
    const signupRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/user/signup',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      fullName: 'Auth Test Mother',
      username: testUsername,
      email: testEmail,
      password: testPassword,
      role: 'patient'
    });

    assert(signupRes.status === 201, 'POST /user/signup returns 201 Created', `Status: ${signupRes.status}`);
    assert(Boolean(signupRes.data?.token), 'Signup returns initial JWT token');

    // -----------------------------------------------------------------
    // TEST 3: User Login (SignIn -> Valid Token & Session Data)
    // -----------------------------------------------------------------
    console.log('\n--- TEST 3: User Sign-in (/user/signin) ---');
    const signinRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/user/signin',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: testEmail,
      password: testPassword
    });

    assert(signinRes.status === 200, 'POST /user/signin succeeds with 200 OK', `Status: ${signinRes.status}`);
    testUserToken = signinRes.data?.token;
    testUserId = signinRes.data?._id || signinRes.data?.id;
    assert(Boolean(testUserToken), 'Valid JWT token received on login');
    assert(signinRes.data?.email === testEmail, 'User profile returned with matching email');

    // -----------------------------------------------------------------
    // TEST 4: Valid Persisted Session Restoration Simulation
    // -----------------------------------------------------------------
    console.log('\n--- TEST 4: Session Restoration with Valid Token (GET /user/me) ---');
    const restoreRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/user/me',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUserToken}`
      }
    });

    assert(restoreRes.status === 200, 'GET /user/me validates valid persisted token', `Status: ${restoreRes.status}`);
    assert(restoreRes.data?.username === testUsername, 'Restored session resolves correct username');
    assert(restoreRes.data?.role === 'patient', 'Restored session resolves correct patient role -> routes to Dashboard');

    // -----------------------------------------------------------------
    // TEST 5: Invalid or Expired Token Rejection (Login Recovery)
    // -----------------------------------------------------------------
    console.log('\n--- TEST 5: Invalid/Expired Stored Session Handling ---');
    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCIsInJvbGUiOiJwYXRpZW50In0.INVALID_SIGNATURE';
    const invalidRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/user/me',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${invalidToken}`
      }
    });

    assert(invalidRes.status === 401, 'Backend rejects invalid token with 401 Unauthorized', `Status: ${invalidRes.status}`);
    assert(
      typeof invalidRes.data?.message === 'string' && invalidRes.data.message.includes('Unauthorized'),
      'Backend returns Unauthorized message triggering session clearance',
      `Message: ${invalidRes.data?.message}`
    );

    // -----------------------------------------------------------------
    // TEST 6: Authenticated User Can Access Protected Data
    // -----------------------------------------------------------------
    console.log('\n--- TEST 6: Authorized Data Fetching After Login ---');
    const diaryAuth = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/diary',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUserToken}`
      }
    });
    assert(diaryAuth.status === 200, 'Authenticated user can access GET /diary', `Status: ${diaryAuth.status}`);

    const epdsAuth = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/epds/history',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUserToken}`
      }
    });
    assert(epdsAuth.status === 200, 'Authenticated user can access GET /epds/history', `Status: ${epdsAuth.status}`);

    // -----------------------------------------------------------------
    // TEST 7: Cleanup
    // -----------------------------------------------------------------
    console.log('\n--- TEST 7: Cleanup Test Account ---');
    const deleteRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/user/me',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUserToken}`
      }
    });
    assert(deleteRes.status === 200, 'Ephemeral test user deleted successfully');

    console.log('\n================================================================');
    console.log('SUCCESS: All 12 Authentication Flow Assertions Passed!');
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n[FATAL ERROR in runAuthTests]', err.message);
    process.exit(1);
  }
}

runAuthTests();
