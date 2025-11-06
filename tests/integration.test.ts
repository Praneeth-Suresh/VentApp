/**
 * Comprehensive Integration Tests for NUS Anonymous Feedback MVP
 *
 * Tests all major workflows:
 * - User submission flow
 * - Query tracking
 * - Moderation workflow
 * - Admin analytics
 *
 * Run with: npm test
 */

interface TestContext {
  submissionIds: string[]
  apiKey: string
}

const BASE_URL = process.env.API_URL || "http://localhost:3000"
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "test-key-123"

const context: TestContext = {
  submissionIds: [],
  apiKey: ADMIN_API_KEY,
}

let testsPassed = 0
let testsFailed = 0

class TestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "TestError"
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new TestError(message)
  }
}

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn()
    console.log(`✓ ${name}`)
    testsPassed++
  } catch (error) {
    console.log(`✗ ${name}`)
    if (error instanceof TestError) {
      console.log(`  ${error.message}`)
    } else {
      console.log(`  ${error instanceof Error ? error.message : String(error)}`)
    }
    testsFailed++
  }
}

// =============================================================================
// WORKFLOW 1: User Submission Flow
// =============================================================================

async function testUserSubmissionFlow(): Promise<void> {
  console.log("\n=== User Submission Flow ===\n")

  await test("Submit valid feedback", async () => {
    const response = await fetch(`${BASE_URL}/api/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "The library needs better WiFi coverage during peak hours",
      }),
    })

    assert(response.ok, `Expected 200-299, got ${response.status}`)
    const data = await response.json()
    assert(data.id, "Response should contain submission ID")
    assert(typeof data.id === "string", "ID should be a string")
    context.submissionIds.push(data.id)
  })

  await test("Submit feedback with counter increment", async () => {
    const countBefore = await getSubmissionCount()

    const response = await fetch(`${BASE_URL}/api/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Test feedback for counter" }),
    })

    assert(response.ok, `Expected 200-299, got ${response.status}`)
    const data = await response.json()
    context.submissionIds.push(data.id)

    const countAfter = await getSubmissionCount()
    assert(countAfter > countBefore, "Counter should increment after submission")
  })

  await test("Reject empty submission", async () => {
    const response = await fetch(`${BASE_URL}/api/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "" }),
    })

    assert(!response.ok, "Should reject empty submission")
  })

  await test("Reject oversized submission (>1000 chars)", async () => {
    const longContent = "x".repeat(1001)
    const response = await fetch(`${BASE_URL}/api/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: longContent }),
    })

    assert(!response.ok, "Should reject oversized submission")
  })

  await test("Accept submission at max length (1000 chars)", async () => {
    const maxContent = "y".repeat(1000)
    const response = await fetch(`${BASE_URL}/api/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: maxContent }),
    })

    assert(response.ok, `Expected 200-299, got ${response.status}`)
    const data = await response.json()
    context.submissionIds.push(data.id)
  })
}

// =============================================================================
// WORKFLOW 2: Query Tracking
// =============================================================================

async function testQueryTracking(): Promise<void> {
  console.log("\n=== Query Tracking Flow ===\n")

  const testId = context.submissionIds[0]

  await test("Retrieve submission by ID", async () => {
    const response = await fetch(`${BASE_URL}/api/submissions/${testId}`)

    assert(response.ok, `Expected 200-299, got ${response.status}`)
    const data = await response.json()
    assert(data.id === testId, "ID should match")
    assert(data.content, "Should have content")
    assert(data.timestamp, "Should have timestamp")
    assert(data.status === "pending", "Initial status should be pending")
  })

  await test("Return 404 for non-existent submission", async () => {
    const response = await fetch(`${BASE_URL}/api/submissions/non-existent-id-12345`)

    assert(response.status === 404, "Should return 404 for non-existent ID")
  })

  await test("Get submission count", async () => {
    const response = await fetch(`${BASE_URL}/api/submissions/count`)

    assert(response.ok, `Expected 200-299, got ${response.status}`)
    const data = await response.json()
    assert(typeof data.count === "number", "Count should be a number")
    assert(data.count >= context.submissionIds.length, "Count should match submissions")
  })
}

// =============================================================================
// WORKFLOW 3: Moderation
// =============================================================================

async function testModerationFlow(): Promise<void> {
  console.log("\n=== Moderation Workflow ===\n")

  const flagId = context.submissionIds[1]
  const approvingId = context.submissionIds[0]

  await test("Reject flag action without auth", async () => {
    const response = await fetch(`${BASE_URL}/api/submissions/${flagId}/flag`, {
      method: "PATCH",
    })

    assert(response.status === 401, "Should require authorization")
  })

  await test("Flag submission with valid API key", async () => {
    const response = await fetch(`${BASE_URL}/api/submissions/${flagId}/flag`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${context.apiKey}` },
    })

    assert(response.ok, `Expected 200-299, got ${response.status}`)

    // Verify status changed
    const submission = await getSubmissionById(flagId)
    assert(submission.status === "flagged", "Status should be flagged")
  })

  await test("Approve submission with valid API key", async () => {
    const response = await fetch(`${BASE_URL}/api/submissions/${approvingId}/clear`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${context.apiKey}` },
    })

    assert(response.ok, `Expected 200-299, got ${response.status}`)

    // Verify status changed
    const submission = await getSubmissionById(approvingId)
    assert(submission.status === "approved", "Status should be approved")
  })

  await test("Get submissions by status", async () => {
    const pendingResponse = await fetch(`${BASE_URL}/api/submissions?status=pending`, {
      headers: { Authorization: `Bearer ${context.apiKey}` },
    })

    assert(pendingResponse.ok, `Expected 200-299, got ${pendingResponse.status}`)
    const pendingData = await pendingResponse.json()
    assert(Array.isArray(pendingData), "Should return array")

    const flaggedResponse = await fetch(`${BASE_URL}/api/submissions?status=flagged`, {
      headers: { Authorization: `Bearer ${context.apiKey}` },
    })

    assert(flaggedResponse.ok, `Expected 200-299, got ${flaggedResponse.status}`)
    const flaggedData = await flaggedResponse.json()
    assert(Array.isArray(flaggedData), "Should return array")
    // Verify our flagged submission is in the list
    const hasOurSubmission = flaggedData.some((sub: any) => sub.id === flagId)
    assert(hasOurSubmission, "Should contain our flagged submission")
  })
}

// =============================================================================
// WORKFLOW 4: Admin Analytics
// =============================================================================

async function testAdminAnalytics(): Promise<void> {
  console.log("\n=== Admin Analytics Workflow ===\n")

  const approvedId = context.submissionIds[0]

  await test("Reject admin analytics without auth", async () => {
    const response = await fetch(`${BASE_URL}/api/admin/analytics`)

    assert(response.status === 401, "Should require authorization")
  })

  await test("Get analytics with valid API key", async () => {
    const response = await fetch(`${BASE_URL}/api/admin/analytics`, {
      headers: { Authorization: `Bearer ${context.apiKey}` },
    })

    // Analytics might not exist if no approved submissions processed yet
    // This is acceptable for MVP
    assert(response.ok || response.status === 404, "Should return 200 or 404 (no analytics yet)")
  })

  await test("Add admin comment to approved submission", async () => {
    const response = await fetch(`${BASE_URL}/api/admin/submissions/${approvedId}/comment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${context.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment: "This feedback addresses library WiFi coverage in building E2",
      }),
    })

    assert(response.ok, `Expected 200-299, got ${response.status}`)
  })

  await test("Reject oversized admin comment", async () => {
    const longComment = "x".repeat(501)
    const response = await fetch(`${BASE_URL}/api/admin/submissions/${approvedId}/comment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${context.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment: longComment }),
    })

    assert(!response.ok, "Should reject oversized comment")
  })

  await test("Get approved submissions via admin API", async () => {
    const response = await fetch(`${BASE_URL}/api/admin/submissions?status=approved`, {
      headers: { Authorization: `Bearer ${context.apiKey}` },
    })

    assert(response.ok, `Expected 200-299, got ${response.status}`)
    const data = await response.json()
    assert(Array.isArray(data), "Should return array")
  })
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function getSubmissionCount(): Promise<number> {
  const response = await fetch(`${BASE_URL}/api/submissions/count`)
  if (!response.ok) throw new Error("Failed to get count")
  const data = await response.json()
  return data.count
}

async function getSubmissionById(id: string): Promise<any> {
  const response = await fetch(`${BASE_URL}/api/submissions/${id}`)
  if (!response.ok) throw new Error("Failed to get submission")
  return response.json()
}

// =============================================================================
// MAIN TEST RUNNER
// =============================================================================

async function runAllTests(): Promise<void> {
  console.log("╔════════════════════════════════════════════════════╗")
  console.log("║  NUS Anonymous Feedback MVP - Integration Tests    ║")
  console.log("╚════════════════════════════════════════════════════╝")
  console.log(`\nTesting: ${BASE_URL}\n`)

  try {
    // Run all workflows
    await testUserSubmissionFlow()
    await testQueryTracking()
    await testModerationFlow()
    await testAdminAnalytics()

    // Print summary
    console.log("\n╔════════════════════════════════════════════════════╗")
    console.log("║                 TEST SUMMARY                       ║")
    console.log("╚════════════════════════════════════════════════════╝\n")
    console.log(`Total Tests: ${testsPassed + testsFailed}`)
    console.log(`Passed:      ${testsPassed}`)
    console.log(`Failed:      ${testsFailed}`)
    console.log(`Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%\n`)

    if (testsFailed === 0) {
      console.log("✓ All tests passed! Ready for deployment.\n")
      process.exit(0)
    } else {
      console.log("✗ Some tests failed. Please review above.\n")
      process.exit(1)
    }
  } catch (error) {
    console.error("[v0] Test runner error:", error)
    process.exit(1)
  }
}

// Start tests
if (require.main === module) {
  runAllTests()
}

export { runAllTests, type TestContext }
