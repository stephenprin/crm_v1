import { useState } from "react";
import { useToast } from "./ToastProvider";
import { createJob } from "../services/jobService";

interface CreateJobFormProps {
  customerId?: number;
  onClose?: () => void;
}

export const CreateJobForm: React.FC<CreateJobFormProps> = ({
  customerId = 1,
  onClose,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [errors, setErrors] = useState<{
    title?: string;
    customerName?: string;
    customerEmail?: string;
  }>({});
  const { showToast } = useToast();

  const validateForm = () => {
    const newErrors: {
      title?: string;
      customerName?: string;
      customerEmail?: string;
    } = {};
    if (!title.trim()) newErrors.title = "Job title is required";
    if (!customerName.trim())
      newErrors.customerName = "Customer name is required";
    if (!customerEmail.trim()) {
      newErrors.customerEmail = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(customerEmail)) {
      newErrors.customerEmail = "Invalid email format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await createJob({
        title,
        description,
        customer: {
          id: customerId,
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
      });

      showToast({
        title: "Success",
        description: "Job created successfully",
      });

      setTitle("");
      setDescription("");
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setErrors({});

      if (onClose) onClose();
    } catch (error: any) {
      console.error(error);
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        "Could not create job";

      showToast({
        title: "Error",
        description: message,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Create New Job
          </h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Job Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="Enter job title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3 py-2 border ${
                errors.title ? "border-red-500" : "border-gray-300"
              } rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
              required
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="customerName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Customer Name
            </label>
            <input
              id="customerName"
              type="text"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className={`w-full px-3 py-2 border ${
                errors.customerName ? "border-red-500" : "border-gray-300"
              } rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
              required
            />
            {errors.customerName && (
              <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="customerEmail"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Customer Email
            </label>
            <input
              id="customerEmail"
              type="email"
              placeholder="Enter customer email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className={`w-full px-3 py-2 border ${
                errors.customerEmail ? "border-red-500" : "border-gray-300"
              } rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
              required
            />
            {errors.customerEmail && (
              <p className="text-xs text-red-500 mt-1">
                {errors.customerEmail}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="customerPhone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Customer Phone (Optional)
            </label>
            <input
              id="customerPhone"
              type="tel"
              placeholder="Enter customer phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Job Description
            </label>
            <textarea
              id="description"
              placeholder="Enter job description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors min-h-[100px]"
            />
          </div>
          <div className="flex justify-end gap-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              Create Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
