import apiClient from "./apiClient";

export function submitComplaint(data) {
  return apiClient.post("/complaints", data).then((res) => res.data);
}

export function getMyComplaints() {
  return apiClient.get("/complaints/my").then((res) => res.data);
}

export function getAllComplaints() {
  return apiClient.get("/admin/complaints").then((res) => res.data);
}

export function updateComplaintStatus(id, status, adminRemarks) {
  return apiClient
    .patch(`/admin/complaints/${id}/status`, { status, adminRemarks })
    .then((res) => res.data);
}

export function deleteComplaint(id) {
  return apiClient.delete(`/admin/complaints/${id}`);
}

export function uploadComplaintImage(id, file) {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient
    .post(`/complaints/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
}