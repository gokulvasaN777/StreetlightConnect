import apiClient from "./apiClient";

export function getAuditLogs() {
  return apiClient.get("/admin/audit-logs").then((res) => res.data);
}