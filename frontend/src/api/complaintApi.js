import apiClient from "./apiClient";

export function submitComplaint(data) {
  return apiClient
    .post("/api/complaints", data)
    .then((res) => res.data);
}

export function getMyComplaints() {
  return apiClient
    .get("/api/complaints/my")
    .then((res) => res.data);
}

export function getComplaintById(id) {
  return apiClient
    .get(`/api/complaints/${id}`)
    .then((res) => res.data);
}

export function getAllComplaints() {
  return apiClient
    .get("/api/admin/complaints")
    .then((res) => res.data);
}

export function updateComplaintStatus(id, status, adminRemarks) {
  return apiClient
    .patch(`/api/admin/complaints/${id}/status`, {
      status,
      adminRemarks,
    })
    .then((res) => res.data);
}

export function getTechnicians() {
  return apiClient
    .get("/api/admin/technicians")
    .then((res) => res.data);
}

export function assignTechnician(complaintId, technicianId) {
  return apiClient
    .patch(`/api/admin/complaints/${complaintId}/assign-technician`, {
      technicianId,
    })
    .then((res) => res.data);
}

export function deleteComplaint(id) {
  return apiClient.delete(`/api/admin/complaints/${id}`);
}

export function uploadComplaintImage(complaintId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = apiClient.post(
    `/complaints/${complaintId}/image`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}