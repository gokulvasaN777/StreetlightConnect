import apiClient from "./apiClient";

export function getAuditLogs() {
  return apiClient.get("/api/admin/audit-logs").then((res) => res.data);
}