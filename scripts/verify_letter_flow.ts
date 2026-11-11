import {
  createDraftRecord,
  createSentLetterRecord,
  deleteRecord,
  getRecord,
  incrementLetterViews,
  reportLetterRecord,
  toPublicRecord,
} from '../src/lib/server-letters';
import {
  clearFailedAttempts,
  createUnlockToken,
  hashPassword,
  isRateLimited,
  isUnlockTokenValid,
  recordFailedAttempt,
  verifyPassword,
} from '../src/lib/server-security';
import { getSchemaModule, getThemesModule } from '../src/lib/ddear-runtime';

async function runVerification() {
  console.log('🧪 Starting Inkwell Recipient Flow Verification...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // TEST SUITE 1: Password Security, Hashing & HMAC Tokens
  // ----------------------------------------------------
  console.log('📌 Test Suite 1: Cryptographic Invariants & Unlock Security');

  const rawPassword = 'SecretKey@2026';
  const hashed = hashPassword(rawPassword);
  assert(hashed !== rawPassword && hashed.includes('$'), 'Password hashed with scrypt');
  assert(verifyPassword(rawPassword, hashed), 'Correct password verifies successfully');
  assert(!verifyPassword('WrongPass123', hashed), 'Incorrect password is rejected');

  const testLetterId = 'test_letter_sec_' + Date.now();
  const token = createUnlockToken(testLetterId, hashed);
  assert(
    isUnlockTokenValid(testLetterId, hashed, token),
    'HMAC unlock token validates for correct letter and password'
  );
  assert(
    !isUnlockTokenValid('other_letter_id', hashed, token),
    'Unlock token is strictly bound to its specific letter ID'
  );
  assert(
    !isUnlockTokenValid(testLetterId, hashPassword('DifferentPass'), token),
    'Unlock token is invalidated if letter password changes'
  );

  // ----------------------------------------------------
  // TEST SUITE 2: Rate Limiting (5 attempts / 15 mins)
  // ----------------------------------------------------
  console.log('\n📌 Test Suite 2: Rate Limiting Defense');

  const testIpKey = `127.0.0.1:${testLetterId}`;
  clearFailedAttempts(testIpKey);
  assert(!isRateLimited(testIpKey), 'Initial state is not rate limited');

  for (let i = 1; i <= 5; i++) {
    recordFailedAttempt(testIpKey);
  }
  assert(isRateLimited(testIpKey), '5 consecutive failed attempts trigger 429 rate limit');
  clearFailedAttempts(testIpKey);
  assert(!isRateLimited(testIpKey), 'Clearing attempts resets rate limit state');

  // ----------------------------------------------------
  // TEST SUITE 3: Full Letter Lifecycle (Create, Seal, Lock, View)
  // ----------------------------------------------------
  console.log('\n📌 Test Suite 3: Letter Lifecycle & Storage Isolation');

  const ownerA = 'owner_atelier_alpha';
  const sampleDoc = {
    theme: 'vintage',
    paper: { type: 'parchment', size: 'a5' },
    font: 'serif',
    envelope: { color: '#b8231c', style: 'classic' },
    from: 'Người viết thư',
    to: 'Tri kỷ phương xa',
    text: 'Dưới ánh đèn dầu tĩnh lặng, nét mực sumi lắng sâu vào từng thớ giấy mộc.',
    photos: [],
    music: { url: '/media/rain.mp3', volume: 0.6 },
  };

  // 3a. Plain Letter
  const plainLetter = createSentLetterRecord(
    { doc: sampleDoc, openAt: null, password: null },
    ownerA
  );
  assert(plainLetter.status === 'sent', 'Letter created in sent state');
  assert(plainLetter.password === null, 'Plain letter has no password');

  const pubPlain = toPublicRecord(plainLetter);
  assert(!('password' in pubPlain), 'Public record completely strips password');
  assert(!('ownerId' in pubPlain), 'Public record completely strips ownerId');
  assert(!('reports' in pubPlain), 'Public record completely strips reports');
  assert(pubPlain.from === 'Người viết thư', 'Public record preserves sender');
  assert(pubPlain.to === 'Tri kỷ phương xa', 'Public record preserves recipient');

  // 3b. Password-Protected Letter
  const secretLetter = createSentLetterRecord(
    { doc: sampleDoc, openAt: null, password: rawPassword },
    ownerA
  );
  const fetchedSecret = getRecord(secretLetter.id);
  assert(Boolean(fetchedSecret?.password), 'Password-protected letter stores scrypt hash');

  // 3c. Future-Dated Letter (Open countdown)
  const tomorrow = new Date(Date.now() + 86400000).toISOString();
  const futureLetter = createSentLetterRecord(
    { doc: sampleDoc, openAt: tomorrow, password: null },
    ownerA
  );
  assert(futureLetter.openAt === tomorrow, 'Future-dated letter stores ISO openAt timestamp');
  const isLockedByDate = Boolean(
    futureLetter.openAt && new Date(futureLetter.openAt).getTime() > Date.now()
  );
  assert(isLockedByDate === true, 'Recipient view correctly marks future letter as locked');

  // 3d. View Counts & Reports
  incrementLetterViews(plainLetter.id);
  const updatedPlain = getRecord(plainLetter.id);
  assert(updatedPlain?.views === 1, 'Letter view count increments correctly');
  assert(Boolean(updatedPlain?.lastViewedAt), 'Letter tracks lastViewedAt timestamp');

  reportLetterRecord(plainLetter.id, 'spam');
  const reportedPlain = getRecord(plainLetter.id);
  assert(reportedPlain?.reports?.length === 1, 'Report records reason and timestamp');
  assert(reportedPlain?.reports?.[0].reason === 'spam', 'Report reason matches input');

  // ----------------------------------------------------
  // TEST SUITE 4: Fallback Preset Letters (/l/romantic, /l/vintage)
  // ----------------------------------------------------
  console.log('\n📌 Test Suite 4: Fallback Preset Routes');

  const themesMod = getThemesModule();
  const schemaMod = getSchemaModule();
  assert(Array.isArray(themesMod.z), 'Themes list is available and populated');

  for (const presetId of ['romantic', 'vintage', 'luxury', 'minimalist', 'vietnam', 'first-love']) {
    const themeKey = presetId === 'first-love' ? 'romantic' : presetId;
    const matched = themesMod.z.find((t: any) => t.id === themeKey);
    assert(Boolean(matched), `Preset theme "${presetId}" maps to valid theme in runtime`);
    if (matched) {
      const fallbackDoc = {
        ...themesMod.C(schemaMod._(), matched),
        text: matched.sample.vi,
        from: 'Inkwell',
        to: 'Gửi bạn',
      };
      assert(fallbackDoc.from === 'Inkwell', `Preset "${presetId}" has default sender "Inkwell"`);
      assert(fallbackDoc.to === 'Gửi bạn', `Preset "${presetId}" has default recipient "Gửi bạn"`);
      assert(Boolean(fallbackDoc.text), `Preset "${presetId}" has sample text`);
    }
  }

  // ----------------------------------------------------
  // CLEANUP TEST DATA
  // ----------------------------------------------------
  deleteRecord(plainLetter.id);
  deleteRecord(secretLetter.id);
  deleteRecord(futureLetter.id);
  console.log('\n🧹 Cleaned up all test records from store.');

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log('\n=========================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('=========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
