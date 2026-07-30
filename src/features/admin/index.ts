/**
 * Admin Feature Module — Phase 10
 */

// Shared
export { PermissionGuard } from "./shared/components/PermissionGuard";
export { AdminNavTabs } from "./shared/components/AdminNavTabs";

// User Management
export { UsersPage } from "./users/pages/UsersPage";
export { useUsersList, useUserDetail, useCreateUser, useUpdateUser, useToggleUserStatus, useResetUserPassword, useAssignUserRole } from "./users/hooks/use-admin-users";
export { adminUsersApi } from "./users/api/admin-users-api";

// Company Profile
export { CompanyProfilePage } from "./company/pages/CompanyProfilePage";
export { useCompanyProfile, useUpdateCompanyProfile } from "./company/hooks/use-company-profile";

// System Settings
export { SystemSettingsPage } from "./settings/pages/SystemSettingsPage";
export { useSystemSettings, useUpdateSystemSettings } from "./settings/hooks/use-system-settings";

// Email Config
export { EmailConfigPage } from "./email/pages/EmailConfigPage";
export { useEmailConfig, useUpdateEmailConfig } from "./email/hooks/use-email-config";

// Activity Log (consolidated audit log)
export { ActivityLogPage } from "./activity/pages/ActivityLogPage";
export { useAdminAuditLogs } from "./activity/hooks/use-activity-log";
