import React, { useState } from "react";
import { createPayment } from "../services/invoiceService";

interface Payment {
  date: string;
  amount: number;
  payment_date: string;
  method?: string;
}

interface Invoice {
  id?: number;
  status: string;
  subtotal: number;
  tax: number;
  lineItems: { description: string; quantity: number; unit_price: number }[];
  total_amount: number;
  paid_amount: number;
}

interface Job {
  invoice?: Invoice;
}

interface PaymentFlowProps {
  job: Job | null;
  fetchJob: () => Promise<void>;
  showToast: (toast: { title: string; description: string }) => void;
}

export const Payment: React.FC<PaymentFlowProps> = ({
  job,
  fetchJob,
  showToast,
}) => {
  const [open, setOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentErrors, setPaymentErrors] = useState<{
    amount?: string;
    method?: string;
  }>({});

  const remainingBalance = job?.invoice
    ? job.invoice.total_amount - job.invoice.paid_amount
    : 0;

  const validatePayment = () => {
    const newErrors: { amount?: string; method?: string } = {};
    const amount = parseFloat(paymentAmount);
    if (!paymentAmount || isNaN(amount) || amount <= 0) {
      newErrors.amount = "Payment amount must be a positive number.";
    } else if (amount > remainingBalance) {
      newErrors.amount = `Payment cannot exceed remaining balance of $${remainingBalance.toFixed(
        2
      )}.`;
    }
    if (!paymentMethod) {
      newErrors.method = "Please select a payment method.";
    }
    setPaymentErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmPayment = async () => {
    if (!job || !job.invoice) return;
    if (!validatePayment()) return;

    console.log("Processing payment of amount:", paymentAmount);
    console.log("Using payment method:", job.invoice.id);

    try {
      const res = await createPayment(job.invoice.id!, {
        amount: parseFloat(paymentAmount),
      });
      console.log("Payment response:", res);

      showToast({
        title: "Success",
        description: "Payment recorded successfully.",
      });
      fetchJob();
      setOpen(false);
      setPaymentAmount("");
      setPaymentMethod("");
      setPaymentErrors({});
    } catch (err: any) {
      showToast({
        title: "Error",
        description: err.response?.data?.message || "Failed to record payment.",
      });
      console.error("Create payment error:", err);
    }
  };

  if (
    !job ||
    !job.invoice ||
    job.invoice.total_amount <= job.invoice.paid_amount
  ) {
    return null;
  }

  return (
    <div className="mt-6 font-mono">
      {/* Pay Invoice Button */}
      <button
        onClick={() => {
          setPaymentAmount(remainingBalance.toFixed(2));
          setOpen(true);
        }}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm flex items-center space-x-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8c-1.657 0-3 .672-3 1.5S10.343 11 12 11s3-.672 3-1.5S13.657 8 12 8zM5 15h14M5 15a7 7 0 0114 0M5 15H3m16 0h2"
          />
        </svg>
        <span>Pay Invoice</span>
      </button>

      {/* Payment Modal */}
      {open && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full font-mono">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Pay Invoice #{job.invoice.id}
            </h3>

            {/* Invoice Summary */}
            <div className="mb-4 border-b border-gray-200 pb-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total Due:</span>
                <span>${job.invoice.total_amount}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Remaining Balance:</span>
                <span>${remainingBalance}</span>
              </div>
            </div>

            {/* Payment Form */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="paymentAmount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Payment Amount ($)
                </label>
                <input
                  id="paymentAmount"
                  type="number"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className={`w-full px-3 py-2 border ${
                    paymentErrors.amount ? "border-red-500" : "border-gray-300"
                  } rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                  min="0"
                  step="0.01"
                />
                {paymentErrors.amount && (
                  <p className="text-xs text-red-500 mt-1">
                    {paymentErrors.amount}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="paymentMethod"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className={`w-full px-3 py-2 border ${
                    paymentErrors.method ? "border-red-500" : "border-gray-300"
                  } rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                >
                  <option value="">Select a method</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                </select>
                {paymentErrors.method && (
                  <p className="text-xs text-red-500 mt-1">
                    {paymentErrors.method}
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPayment}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Confirm Payment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment History */}
      {job.payments && job.invoice.payments.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Payment History
          </h3>
          <table className="w-full text-sm text-left text-gray-600">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 font-medium text-right">Amount</th>
                <th className="py-2 font-medium">Method</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {job.invoice.payments.map((payment, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-2">
                    {new Date(payment.date).toLocaleString()}
                  </td>
                  <td className="py-2 text-right">
                    ${payment.amount.toFixed(2)}
                  </td>
                  <td className="py-2">{payment.method}</td>
                  <td className="py-2">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        payment.status.toLowerCase() === "success"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
