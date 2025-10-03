import api from "./api";

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  price: number;
}

export const createInvoice = async (
  job_id: number,
  lineItems: InvoiceLineItem[]
) => {
  const res = await api.post(`/invoices/${job_id}/invoice`, { lineItems });
  return res.data;
};
