import api from "./api";

export interface AppointmentPayload {
  technician: string;
  start_time: string;
  end_time: string;
}

export const createAppointment = async (
  job_id: number,
  payload: AppointmentPayload
) => {
  const res = await api.post(`/appointments/${job_id}/appointment`, payload);
  return res.data;
};
