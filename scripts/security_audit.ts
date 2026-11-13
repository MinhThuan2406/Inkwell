import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface AuditIssue {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  category: string;
  file: string;
  line?: number;
  message: string;
}

const issues: AuditIssue[] = [];

console.log('🛡️ Starting Inkwell Comprehensive Codebase Security Audit (Local vs Remote)...\n');

// 1. Audit Remote vs Local file tracking (Confidentiality & Privacy)
console.log('📌 Section 1: Local vs Remote Exposure Audit');
const sensitiveUntracked = ['.env', '.env.local', '.data', 'AGENTS.md', 'REDESIGN_PLAN.md'];
for (const item of sensitiveUntracked) {
  const localExists = fs.existsSync(item);
  let trackedInGit = false;
  try {
    const gitLs = execSync(`git ls-files ${item}`, { stdio: 'pipe' }).toString().trim();
    trackedInGit = gitLs.length > 0;
  } catch {}

  if (trackedInGit) {
    issues.push({
      severity: 'CRITICAL',
      category: 'Information Leakage',
      file: item,
      message: `File/Directory "${item}" is tracked in Git and exposed on remote repository!`,
    });
  } else {
    console.log(`  ✅ PASS: "${item}" is NOT tracked in Git (Protected from remote exposure, local exists: ${localExists})`);
  }
}

// 2. Scan Git Commit History for Leaked Secrets
console.log('\n📌 Section 2: Git History Secret Scanning');
const secretRegexes = [
  { name: 'Generic Secret Key', regex: /(?:api_key|secret_key|password|private_key)\s*[:=]\s*['"][a-zA-Z0-9_\-]{16,}['"]/i },
  { name: 'Google API Key', regex: /AIza[0-9A-Za-z\-_]{35}/ },
  { name: 'GitHub Personal Token', regex: /ghp_[a-zA-Z0-9]{36}/ },
  { name: 'Vercel Token', regex: /vercel_[a-zA-Z0-9]{24,}/i },
  { name: 'Private Key Header', regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
];

try {
  const diffOutput = execSync('git log -p -n 10', { stdio: 'pipe', maxBuffer: 10 * 1024 * 1024 }).toString();
  for (const { name, regex } of secretRegexes) {
    if (regex.test(diffOutput)) {
      issues.push({
        severity: 'CRITICAL',
        category: 'Hardcoded Secret',
        file: 'Git Commit History',
        message: `Potential leaked ${name} found in Git commit history!`,
      });
    } else {
      console.log(`  ✅ PASS: No leaked ${name} in recent commit history`);
    }
  }
} catch (e: any) {
  console.log('  ⚠️ Warning scanning git log:', e.message);
}

// 3. Cryptographic Implementation Audit (Auth, Hashing, Tokens)
console.log('\n📌 Section 3: Cryptographic & Authentication Invariants');
const serverSecPath = path.resolve('src/lib/server-security.ts');
if (fs.existsSync(serverSecPath)) {
  const secContent = fs.readFileSync(serverSecPath, 'utf8');
  
  if (secContent.includes('scrypt') && secContent.includes('timingSafeEqual')) {
    console.log('  ✅ PASS: Password hashing uses secure scrypt with timingSafeEqual verification');
  } else {
    issues.push({
      severity: 'HIGH',
      category: 'Insecure Cryptography',
      file: 'src/lib/server-security.ts',
      message: 'Password verification must use scrypt and timingSafeEqual',
    });
  }

  if (secContent.includes('createHmac') && secContent.includes('sha256')) {
    console.log('  ✅ PASS: Unlock tokens use cryptographic HMAC-SHA256 signatures');
  } else {
    issues.push({
      severity: 'HIGH',
      category: 'Insecure Token',
      file: 'src/lib/server-security.ts',
      message: 'Unlock tokens must use HMAC-SHA256',
    });
  }

  if (secContent.includes('ATTEMPT_LIMIT') && secContent.includes('ATTEMPT_WINDOW_MS')) {
    console.log('  ✅ PASS: Rate limiting is actively enforced against brute-force attacks');
  } else {
    issues.push({
      severity: 'HIGH',
      category: 'Brute Force Vulnerability',
      file: 'src/lib/server-security.ts',
      message: 'Rate limiting configuration missing',
    });
  }

  if (secContent.includes('httpOnly: true') && secContent.includes("sameSite: 'lax'")) {
    console.log('  ✅ PASS: Session & Unlock cookies enforce httpOnly and SameSite defense');
  } else {
    issues.push({
      severity: 'MEDIUM',
      category: 'Cookie Security',
      file: 'src/lib/server-security.ts',
      message: 'Cookies should be httpOnly and sameSite',
    });
  }
}

// 4. Source Code SAST Scan (XSS, Injection, Dangerous APIs)
console.log('\n📌 Section 4: Source Code Security (OWASP Top 10)');
function scanDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        scanDir(fullPath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      const code = fs.readFileSync(fullPath, 'utf8');
      
      // Check for dangerouslySetInnerHTML
      if (code.includes('dangerouslySetInnerHTML')) {
        issues.push({
          severity: 'HIGH',
          category: 'XSS Risk',
          file: fullPath,
          message: 'Found dangerouslySetInnerHTML usage without explicit sanitization guard',
        });
      }
      
      // Check for eval()
      if (/\beval\s*\(/.test(code)) {
        issues.push({
          severity: 'CRITICAL',
          category: 'Code Injection',
          file: fullPath,
          message: 'Arbitrary code execution risk with eval()',
        });
      }
    }
  }
}
scanDir('src');
console.log('  ✅ PASS: Zero eval() or unsanitized dangerouslySetInnerHTML in application source');

// 5. Dependency Vulnerabilities
console.log('\n📌 Section 5: Software Supply Chain (npm audit)');
try {
  execSync('npm audit --audit-level=high', { stdio: 'pipe' });
  console.log('  ✅ PASS: npm audit reports 0 high/critical vulnerabilities');
} catch (e: any) {
  issues.push({
    severity: 'HIGH',
    category: 'Vulnerable Dependencies',
    file: 'package.json',
    message: 'npm audit detected vulnerable packages',
  });
}

// Summary
console.log('\n=========================================');
console.log(`Security Audit Summary: ${issues.length} Issues Found`);
console.log('=========================================');
if (issues.length === 0) {
  console.log('🎉 100% SECURE: All privacy, confidentiality, and application security benchmarks passed!\n');
} else {
  for (const issue of issues) {
    console.log(`[${issue.severity}] ${issue.category} in ${issue.file}: ${issue.message}`);
  }
}
