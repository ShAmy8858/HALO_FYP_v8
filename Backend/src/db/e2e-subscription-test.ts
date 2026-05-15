/**
 * E2E Subscription Flow Test Script
 * Tests: Register → Admin Approve → Manager Login → Subscription Gate → Payment Submit → Admin Review → Dashboard Unlock
 */
import "dotenv/config";
import fs from "fs";
import path from "path";

const API = "http://localhost:4000/api";

async function api(url: string, opts: any = {}) {
  const res = await fetch(`${API}${url}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data: body?.data, error: body?.error };
}

async function apiAuth(url: string, token: string, opts: any = {}) {
  return api(url, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });
}

function pass(label: string) { console.log(`  ✅ ${label}`); }
function fail(label: string, detail?: any) { console.error(`  ❌ ${label}`, detail || ""); process.exit(1); }

async function run() {
  console.log("\n═══════════════════════════════════════════");
  console.log("  HALO E2E Subscription Flow Test");
  console.log("═══════════════════════════════════════════\n");

  // ─── Step 1: Login as Admin ────────────────────────────────────
  console.log("Step 1: Admin Login");
  const adminLogin = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@halo.pk", password: "Admin@2025", role: "ADMIN" }),
  });
  if (!adminLogin.ok) fail("Admin login failed", adminLogin.error);
  const adminToken = adminLogin.data.accessToken;
  pass("Admin logged in");

  // ─── Step 2: Register a new hospital (atomic: docs + user + SUBMITTED) ───
  console.log("\nStep 2: Hospital Registration (register-complete)");
  const managerEmail = `manager-${Date.now()}@testhospital.pk`;
  const regData = new FormData();
  regData.set("hospitalName", "E2E Test Hospital Lahore");
  regData.set("facilityType", "General Hospital");
  regData.set("licenseNumber", `LIC-E2E-${Date.now()}`);
  regData.set("phone", "+92-42-99990001");
  regData.set("businessEmail", `e2e-${Date.now()}@testhospital.pk`);
  regData.set("province", "Punjab");
  regData.set("city", "Lahore");
  regData.set("postalCode", "54000");
  regData.set("address", "Mall Road, E2E Test");
  regData.set("managerName", "Test Manager");
  regData.set("managerContactNumber", "+92-321-0001234");
  regData.set("managerEmail", managerEmail);
  regData.set("managerPassword", "Manager@2026");

  // Create a minimal PNG file for document upload
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
    0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
    0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC,
    0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
    0x44, 0xAE, 0x42, 0x60, 0x82,
  ]);
  const blob = new Blob([pngHeader], { type: "image/png" });
  regData.set("registrationCertificate", blob, "cert.png");
  regData.set("medicalLicense", blob, "license.png");

  const regRes = await fetch(`${API}/hospital-applications/register-complete`, {
    method: "POST",
    body: regData,
  });
  const regBody = await regRes.json();
  if (!regRes.ok) fail("Registration failed", regBody.error);
  const applicationId = regBody.data.application.id;
  const appRefId = regBody.data.application.applicationId;
  pass(`Application created: ${appRefId} (manager: ${managerEmail})`);

  // ─── Step 3: Submit the application ─────────────────────────────
  console.log("\nStep 3: Submit Application");
  // The application may already be auto-submitted. Check its status.
  const appDetail = await apiAuth(`/admin/applications/${applicationId}`, adminToken);
  if (!appDetail.ok) fail("Failed to fetch application", appDetail.error);
  const appStatus = appDetail.data.application.status;
  pass(`Application status: ${appStatus}`);

  // ─── Step 4: Admin approves the application ─────────────────────
  console.log("\nStep 4: Admin Approves Application");
  if (appStatus === "SUBMITTED" || appStatus === "UNDER_REVIEW") {
    const approveRes = await apiAuth(`/admin/applications/${applicationId}/review`, adminToken, {
      method: "POST",
      body: JSON.stringify({ action: "approve" }),
    });
    if (!approveRes.ok) fail("Approval failed", approveRes.error);
    pass("Application APPROVED");
  } else if (appStatus === "APPROVED") {
    pass("Already approved");
  } else {
    // Try to submit first then approve
    const submitRes = await fetch(`${API}/hospital-applications/${applicationId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (submitRes.ok) {
      pass("Application submitted");
      const approveRes = await apiAuth(`/admin/applications/${applicationId}/review`, adminToken, {
        method: "POST",
        body: JSON.stringify({ action: "approve" }),
      });
      if (!approveRes.ok) fail("Approval failed after submit", approveRes.error);
      pass("Application APPROVED");
    } else {
      fail(`Unexpected status: ${appStatus}`, await submitRes.json());
    }
  }

  // ─── Step 5: Manager logs in ────────────────────────────────────
  console.log("\nStep 5: Manager Login");
  const managerLogin = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: managerEmail, password: "Manager@2026", role: "MANAGER" }),
  });
  if (!managerLogin.ok) fail("Manager login failed", managerLogin.error);
  const managerToken = managerLogin.data.accessToken;
  pass(`Manager logged in (role: ${managerLogin.data.user.role})`);

  // ─── Step 6: Check subscription status (should be TRIAL) ───────
  console.log("\nStep 6: Check Subscription Status");
  const subStatus = await apiAuth("/subscription/status", managerToken);
  if (!subStatus.ok) fail("Status check failed", subStatus.error);
  if (subStatus.data.subscriptionTier !== "TRIAL") fail(`Expected TRIAL, got ${subStatus.data.subscriptionTier}`);
  pass(`Subscription tier: ${subStatus.data.subscriptionTier} (gate will block)`);

  // ─── Step 7: Get available plans ────────────────────────────────
  console.log("\nStep 7: Fetch Available Plans");
  const plansRes = await apiAuth("/subscription/plans", managerToken);
  if (!plansRes.ok) fail("Plans fetch failed", plansRes.error);
  pass(`${plansRes.data.plans.length} plans available: ${plansRes.data.plans.map((p: any) => `${p.name} (PKR ${p.price})`).join(", ")}`);
  pass(`${plansRes.data.paymentMethods.length} payment methods: ${plansRes.data.paymentMethods.map((m: any) => m.label).join(", ")}`);

  // ─── Step 8: Submit payment receipt ─────────────────────────────
  console.log("\nStep 8: Submit Payment Receipt");
  const paymentForm = new FormData();
  paymentForm.set("selectedPlan", "PROFESSIONAL");
  paymentForm.set("amount", "14999");
  paymentForm.set("paymentMethod", "JazzCash");
  paymentForm.set("bankReference", "TRX-E2E-001");
  paymentForm.set("receipt", blob, "receipt.png");

  const paymentRes = await fetch(`${API}/subscription/payment`, {
    method: "POST",
    body: paymentForm,
    headers: { Authorization: `Bearer ${managerToken}` },
  });
  const paymentBody = await paymentRes.json();
  if (!paymentRes.ok) fail("Payment submission failed", paymentBody.error);
  const paymentId = paymentBody.data.payment.id;
  pass(`Payment submitted: ${paymentId} (plan: PROFESSIONAL, amount: 14999)`);

  // ─── Step 9: Verify subscription status is now PENDING ──────────
  console.log("\nStep 9: Check Pending Status");
  const pendingStatus = await apiAuth("/subscription/status", managerToken);
  if (!pendingStatus.ok) fail("Status check failed", pendingStatus.error);
  if (pendingStatus.data.latestPayment?.status !== "PENDING_REVIEW") fail("Expected PENDING_REVIEW");
  pass(`Payment status: ${pendingStatus.data.latestPayment.status}`);

  // ─── Step 10: Admin sees payment in review queue ────────────────
  console.log("\nStep 10: Admin Views Payment Queue");
  const adminPayments = await apiAuth("/subscription/admin/payments", adminToken);
  if (!adminPayments.ok) fail("Admin payments fetch failed", adminPayments.error);
  const pendingPayments = adminPayments.data.payments.filter((p: any) => p.status === "PENDING_REVIEW");
  pass(`${pendingPayments.length} pending payment(s) in queue`);
  const targetPayment = pendingPayments.find((p: any) => p.id === paymentId);
  if (!targetPayment) fail("Payment not found in admin queue");
  pass(`Found: ${targetPayment.hospitalName || "Hospital"} → ${targetPayment.selectedPlan} (PKR ${targetPayment.amount})`);

  // ─── Step 11: Admin approves payment ────────────────────────────
  console.log("\nStep 11: Admin Approves Payment");
  const reviewRes = await apiAuth(`/subscription/admin/payments/${paymentId}/review`, adminToken, {
    method: "POST",
    body: JSON.stringify({ action: "APPROVED", adminNotes: "E2E test — verified receipt" }),
  });
  if (!reviewRes.ok) fail("Payment approval failed", reviewRes.error);
  pass("Payment APPROVED by admin");

  // ─── Step 12: Verify subscription tier is now PROFESSIONAL ──────
  console.log("\nStep 12: Verify Dashboard Unlocked");
  const finalStatus = await apiAuth("/subscription/status", managerToken);
  if (!finalStatus.ok) fail("Final status check failed", finalStatus.error);
  if (finalStatus.data.subscriptionTier !== "PROFESSIONAL") {
    fail(`Expected PROFESSIONAL, got ${finalStatus.data.subscriptionTier}`);
  }
  pass(`Subscription tier: ${finalStatus.data.subscriptionTier} ← Dashboard is UNLOCKED! 🎉`);

  console.log("\n═══════════════════════════════════════════");
  console.log("  ✅ ALL 12 STEPS PASSED — E2E FLOW COMPLETE");
  console.log("═══════════════════════════════════════════\n");
}

run().catch((err) => {
  console.error("\n❌ UNEXPECTED ERROR:", err);
  process.exit(1);
});
