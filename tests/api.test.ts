/**
 * API Integration Tests
 * Run with: npm test
 */

const BASE_URL = process.env.API_URL || "http://localhost:3000"
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "test-key"

interface TestResult {
  name: string
  passed: boolean
  error?: string
}

const results: TestResult[] = []

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    results.push({ name, passed: true })
    console.log(`✓ ${name}`)
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    })
    console.log(`✗ ${name}`)
    console.log(`  Error: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message)
  }
}

// Tests
async function runTests() {
  console.log("[v0] Starting API Tests\n")

  let submissionId: string

  // Test 1: Create Submission
  await test("POST /api/submissions - Create submission", async () => {
    const response = await fetch(`${BASE_URL}/api/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Test feedback for API testing" }),
    })

    assert(response.ok, `Expected status 200-299, got ${response.status}`)
    const data = await response.json()
    assert(data.id, "Response should contain id")
    submissionId = data.id
  })

  // Test 2: Get Submissions Count
  await test("GET /api/submissions/count - Get count", async () => {
    const response = await fetch(`${BASE_URL}/api/submissions/count`)
    assert(response.ok, `Expected status 200-299, got ${response.status}`)
    const data = await response.json()
    assert(typeof data.count === "number", "Count should be a number")
  })

  // Test 3: Get Submission by ID
  await test("GET /api/submissions/[id] - Get submission", async () => {
    const response = await fetch(`${BASE_URL}/api/submissions/${submissionId}`)
    assert(response.ok, `Expected status 200-299, got ${response.status}`)
    const data = await response.json()
    assert(data.id === submissionId, "ID should match")
    assert(data.content, "Should have content")
  })

  // Test 4: Flag Submission (Unauthorized)
  await test("PATCH /api/submissions/[id]/flag - Reject without auth", async () => {
    const response = await fetch(`${BASE_URL}/api/submissions/${submissionId}/flag`, { method: "PATCH" })
    assert(response.status === 401, "Should require authorization")
  })

  // Test 5: Flag Submission (Authorized)
  await test("PATCH /api/submissions/[id]/flag - Flag with auth", async () => {
    const response = await fetch(`${BASE_URL}/api/submissions/${submissionId}/flag`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${ADMIN_API_KEY}` },
    })
    assert(response.ok, `Expected status 200-299, got ${response.status}`)
  })

  // Test 6: Create another submission for clearing
  let submissionId2: string
  await test("POST /api/submissions - Create second submission", async () => {
    const response = await fetch(`${BASE_URL}/api/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Another test feedback" }),
    })

    assert(response.ok, `Expected status 200-299, got ${response.status}`)
    const data = await response.json()
    submissionId2 = data.id
  })

  // Test 7: Clear Submission
  await test("PATCH /api/submissions/[id]/clear - Clear with auth", async () => {
    const response = await fetch(`${BASE_URL}/api/submissions/${submissionId2}/clear`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${ADMIN_API_KEY}` },
    })
    assert(response.ok, `Expected status 200-299, got ${response.status}`)
  })

  // Test 8: Get Submissions by Status
  await test("GET /api/submissions?status=pending - Filter by status", async () => {
    const response = await fetch(`${BASE_URL}/api/submissions?status=pending`, {
      headers: { Authorization: `Bearer ${ADMIN_API_KEY}` },
    })
    assert(response.ok, `Expected status 200-299, got ${response.status}`)
    const data = await response.json()
    assert(Array.isArray(data), "Should return array")
  })

  // Test 9: Add Admin Comment
  await test("POST /api/admin/submissions/[id]/comment - Add comment", async () => {
    const response = await fetch(`${BASE_URL}/api/admin/submissions/${submissionId2}/comment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ADMIN_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment: "Test admin comment" }),
    })
    assert(response.ok, `Expected status 200-299, got ${response.status}`)
  })

  // Summary
  console.log("\n--- Test Summary ---")
  const passed = results.filter((r) => r.passed).length
  const total = results.length
  console.log(`Passed: ${passed}/${total}`)

  if (passed === total) {
    console.log("\n✓ All tests passed!")
    process.exit(0)
  } else {
    console.log("\n✗ Some tests failed")
    process.exit(1)
  }
}

runTests().catch((error) => {
  console.error("[v0] Test runner error:", error)
  process.exit(1)
})
