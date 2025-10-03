import api from "./api";

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export const createInvoice = async (
  job_id: number,
  lineItems: InvoiceLineItem[]
) => {
  const res = await api.post(`/invoices/${job_id}/invoice`, { lineItems });
  return res.data;
};

export const createPayment = async (invoice_id: number, amount: number) => {
  const res = await api.post(`/payments/${invoice_id}/create`, amount);
  return res.data;
};
