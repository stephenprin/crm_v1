import api from "./api";

export interface JobPayload {
  title: string;
  description: string;
  customer_id: number;
}

export const getJobs = async () => {
  const res = await api.get("/jobs");
  return res.data;
};

export const getJobById = async (id: number) => {
  const res = await api.get(`/jobs/${id}`);
  return res.data;
};

export const createJob = async (payload: JobPayload) => {
  const res = await api.post("/jobs", payload);
  return res.data;
};

export const updateJobStatus = async (id: number, status: string) => {
  const res = await api.patch(`/jobs/${id}/status`, { status });
  console.log(res.data);
  return res.data;
};
