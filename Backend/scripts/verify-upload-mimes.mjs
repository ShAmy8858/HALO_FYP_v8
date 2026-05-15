/**
 * Dev check: POST one doc per MIME case to a fresh draft application.
 * Run with API already listening: node scripts/verify-upload-mimes.mjs
 */
const API = "http://localhost:4000/api";
const png = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, 0x00,
  0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00,
  0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
  0xe2, 0x21, 0xbc, 0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);

async function createApp(ts) {
  const r = await fetch(`${API}/hospital-applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      hospitalName: `MIME verify ${ts}`,
      facilityType: "General Hospital",
      licenseNumber: `LIC-MV-${ts}`,
      businessEmail: `mvbiz${ts}@test.pk`,
      phone: "+92-300-1234567",
      province: "Punjab",
      city: "Lahore",
      postalCode: "54000",
      address: "Addr",
      managerName: "John Manager",
      managerEmail: `mvmgr${ts}@test.pk`,
      managerContactNumber: "+92-300-7654321",
      managerPassword: "Password1!",
    }),
  });
  const j = await r.json();
  if (!j.success) throw new Error(JSON.stringify(j));
  return j.data.application.id;
}

async function upload(id, mime, filename) {
  const blob = new Blob([png], { type: mime });
  const fd = new FormData();
  fd.append("file", blob, filename);
  fd.append("documentType", "medical_license");
  const up = await fetch(`${API}/hospital-applications/${id}/documents`, { method: "POST", body: fd });
  return { status: up.status, json: await up.json() };
}

const ts = Date.now();
const id = await createApp(ts);

const cases = [
  ["image/jpg", "legacy.jpg"],
  ["", "infer.png"],
  ["application/octet-stream", "infer-from-name.jpeg"],
  ["image/webp", "x.webp"],
];

let failed = false;
for (const [mime, name] of cases) {
  const r = await upload(id, mime, name);
  const ok = r.status === 201 && r.json.success;
  console.log(mime || "(empty)", name, "->", ok ? "OK" : r.status, ok ? "" : r.json.error?.code || r.json);
  if (!ok) failed = true;
}

process.exit(failed ? 1 : 0);
