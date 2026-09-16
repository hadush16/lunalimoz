import { runPricingUnitTests } from "../lib/pricing/__tests__/engine.test";
import { runCancellationUnitTests } from "../lib/policy/__tests__/cancellationFee.test";

async function main() {
  console.log("=== LUNA LIMO UNIT TEST SUITE ===\n");
  let allPassed = true;

  console.log("--- 1. Pricing Engine Unit Tests ---");
  const pricingResults = await runPricingUnitTests();
  for (const r of pricingResults) {
    if (r.passed) {
      console.log(`  ✓ PASS: ${r.name}`);
    } else {
      console.error(`  ✗ FAIL: ${r.name} -> ${r.error}`);
      allPassed = false;
    }
  }

  console.log("\n--- 2. Cancellation & No-Show Policy Fee Tests ---");
  const cancelResults = runCancellationUnitTests();
  for (const r of cancelResults) {
    if (r.passed) {
      console.log(`  ✓ PASS: ${r.name}`);
    } else {
      console.error(`  ✗ FAIL: ${r.name} -> ${r.error}`);
      allPassed = false;
    }
  }

  console.log("\n==================================");
  if (allPassed) {
    console.log(" ALL UNIT TESTS PASSED SUCCESSFULLY! (0 Failures)\n");
    process.exit(0);
  } else {
    console.error(" SOME UNIT TESTS FAILED.\n");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
