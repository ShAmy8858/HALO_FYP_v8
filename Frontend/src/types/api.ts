export type UserRole = "ADMIN" | "MANAGER";
export type UserStatus = "PENDING" | "ACTIVE" | "SUSPENDED";
export type ApplicationStatus = "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
export type HospitalStatus = "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
export type SubscriptionTier = "TRIAL" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
export type NotificationStatus = "PENDING" | "SENT" | "FAILED" | "RETRYING";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  contactNumber: string | null;
  role: UserRole;
  status: UserStatus;
  hospitalId: string | null;
  lastLoginAt: string | null;
}

export interface HospitalApplication {
  id: string;
  applicationId: string;
  status: ApplicationStatus;
  hospitalName: string;
  facilityType: string;
  licenseNumber: string;
  businessEmail: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string;
  address: string | null;
  managerFirstName: string;
  managerLastName: string;
  managerEmail: string;
  managerContactNumber: string;
  managerUserId: string;
  rejectionReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HospitalDocument {
  id: string;
  applicationId: string;
  documentType: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  storageProvider: string;
  storageKey: string;
  secureUrl: string | null;
  status: "UPLOADED" | "VERIFIED" | "REJECTED";
  uploadedAt: string;
}

export interface Hospital {
  id: string;
  hospitalCode: string;
  slug: string;
  name: string;
  facilityType: string;
  licenseNumber: string;
  businessEmail: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string;
  address: string | null;
  status: HospitalStatus;
  subscriptionTier: SubscriptionTier;
  activatedAt: string | null;
  deactivatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformSettings {
  id: string;
  registrationEnabled: boolean;
  allowedFileTypes: string[];
  maxUploadSizeMb: number;
  defaultSubscriptionTier: SubscriptionTier;
  supportEmail: string;
  rejectionReasons: string[];
  updatedAt: string;
}

export interface EmailTemplate {
  id: string;
  type: string;
  subject: string;
  body: string;
  updatedAt: string;
}

export interface NotificationLog {
  id: string;
  type: string;
  recipient: string;
  subject: string;
  body: string;
  status: NotificationStatus;
  attempts: number;
  lastError: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED";

export interface SubscriptionPayment {
  id: string;
  hospitalId: string;
  hospitalName?: string;
  submittedBy: string;
  managerName?: string;
  managerLastName?: string;
  managerEmail?: string;
  selectedPlan: SubscriptionTier;
  receiptUrl: string;
  storageKey: string;
  bankReference: string | null;
  paymentMethod: string | null;
  amount: number | null;
  status: PaymentStatus;
  adminNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: number;
  period: string;
  popular?: boolean;
  description: string;
  features: string[];
}

export interface PaymentMethod {
  type: string;
  label: string;
  accountTitle: string;
  accountNumber: string;
  details?: string;
}
