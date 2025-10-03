import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById } from "../services/jobService";
import { createAppointment } from "../services/appointmentService";
import {
  createInvoice,
  type InvoiceLineItem,
} from "../services/invoiceService";
import { useToast } from "./ToastProvider";
import { Payment } from "./Payment";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Job {
  job: {
    job_id: number;
    title: string;
    description: string;
    status: "NEW" | "SCHEDULED" | "COMPLETED" | "INVOICED" | "PAID";
    created_at: string;
    customer_id?: number;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
  };
  appointment?: {
    technician: string;
    start_time: string;
    end_time: string;
  };
  invoice?: {
    status: string;
    subtotal: number;
    tax: number;
    lineItems: InvoiceLineItem[];
    total_amount: number;
    paid_amount: number;
  };
}

export const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState<
    "details" | "appointment" | "invoice"
  >("details");
  const [technician, setTechnician] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { description: "", quantity: 0, unit_price: 0 },
  ]);
  const [errors, setErrors] = useState<{
    technician?: string;
    startTime?: string;
    endTime?: string;
    lineItems?: string;
  }>({});
  const { showToast } = useToast();

  const fetchJob = React.useCallback(async () => {
    if (!id) return;
    try {
      const data = await getJobById(Number(id));
      setJob(data);
    } catch (err: any) {
      showToast({
        title: "Error",
        description:
          err.response?.data?.message || "Failed to fetch job details.",
      });
      console.error("Fetch job error:", err);
      navigate("/jobs");
    }
  }, [id, showToast, navigate]);

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      showToast({
        title: "Invalid Job ID",
        description: "The requested job ID is missing or invalid.",
      });
      navigate("/jobs");
      return;
    }
    fetchJob();
  }, [id, navigate, showToast, fetchJob]);

  const validateAppointment = () => {
    const newErrors: {
      technician?: string;
      startTime?: string;
      endTime?: string;
    } = {};
    if (!technician.trim())
      newErrors.technician = "Technician name is required";
    if (!startTime) newErrors.startTime = "Start time is required";
    if (!endTime) newErrors.endTime = "End time is required";
    else if (new Date(startTime) >= new Date(endTime))
      newErrors.endTime = "End time must be after start time";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAppointment = async () => {
    if (!job) return;
    if (!validateAppointment()) return;

    try {
      await createAppointment(job.job.job_id, {
        technician,
        start_time: startTime,
        end_time: endTime,
      });
      showToast({
        title: "Success",
        description: "Appointment scheduled successfully.",
      });
      fetchJob();
      setTechnician("");
      setStartTime("");
      setEndTime("");
      setErrors({});
    } catch (err: any) {
      showToast({
        title: "Error",
        description:
          err.response?.data?.error?.message || "Failed to create appointment.",
      });
    }
  };

  const validateInvoice = () => {
    const newErrors: { lineItems?: string } = {};
    if (
      lineItems.length === 0 ||
      lineItems.every(
        (item) =>
          !item.description.trim() || item.quantity <= 0 || item.unit_price <= 0
      )
    ) {
      newErrors.lineItems =
        "Add at least one valid line item with description, quantity, and unit price.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateInvoice = async () => {
    if (!job) return;
    if (!validateInvoice()) return;

    try {
      await createInvoice(job.job.job_id, lineItems);
      showToast({
        title: "Success",
        description: "Invoice generated successfully.",
      });
      fetchJob();
      setLineItems([{ description: "", quantity: 0, unit_price: 0 }]);
      setErrors({});
    } catch (err: any) {
      const message =
        err.response?.data?.error?.message ||
        "Job must be COMPLETED before invoicing";
      showToast({
        title: "Error",
        description: message,
      });
    }
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: "", quantity: 0, unit_price: 0 },
    ]);
  };

  const updateLineItem = (
    index: number,
    field: keyof InvoiceLineItem,
    value: string | number
  ) => {
    setLineItems((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-gray-600 text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden lg:block">
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800">CRM Dashboard</h2>
          <nav className="mt-6">
            <ul>
              <li
                className="py-2 px-4 text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                onClick={() => navigate("/jobs")}
              >
                Jobs Board
              </li>
              <li className="py-2 px-4 text-gray-400 cursor-not-allowed">
                Customers (Coming soon)
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/jobs")}
              className="text-gray-600 hover:text-gray-800 transition-colors"
              aria-label="Back to Jobs Board"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800 truncate">
              {job.job.title}
            </h1>
          </div>
          <span
            className={`text-sm font-medium px-3 py-1 rounded-full ${
              {
                NEW: "bg-blue-100 text-blue-700",
                SCHEDULED: "bg-yellow-100 text-yellow-700",
                COMPLETED: "bg-green-100 text-green-700",
                INVOICED: "bg-purple-100 text-purple-700",
                PAID: "bg-green-200 text-green-700",
              }[job.job.status]
            }`}
          >
            {job.job.status}
          </span>
        </header>

        {/* Tabs and Content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex border-b border-gray-200 mb-6">
              {(
                ["details", "appointment", "invoice"] as Array<
                  "details" | "appointment" | "invoice"
                >
              ).map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === "details" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Job Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Title</p>
                      <p className="text-base font-medium text-gray-900">
                        {job.job.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p
                        className={`text-base font-medium ${
                          {
                            NEW: "text-blue-600",
                            SCHEDULED: "text-yellow-600",
                            COMPLETED: "text-green-700",
                            INVOICED: "text-purple-600",
                            PAID: "text-green-600",
                          }[job.job.status]
                        }`}
                      >
                        {job.job.status}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="text-base text-gray-900">
                        {job.job.description}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Created At</p>
                      <p className="text-base text-gray-900">
                        {new Date(job.job.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="text-base text-gray-900">
                        {job.job.customer_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-base text-gray-900">
                        {job.job.customer_email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="text-base text-gray-900">
                        {job.job.customer_phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appointment" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Schedule Appointment
                </h3>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="technician"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Technician
                    </label>
                    <input
                      id="technician"
                      type="text"
                      placeholder="Enter technician name"
                      value={technician}
                      onChange={(e) => setTechnician(e.target.value)}
                      className={`w-full px-3 py-2 border ${
                        errors.technician ? "border-red-500" : "border-gray-300"
                      } rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                    />
                    {errors.technician && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.technician}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="startTime"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Start Time
                    </label>
                    <input
                      id="startTime"
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className={`w-full px-3 py-2 border ${
                        errors.startTime ? "border-red-500" : "border-gray-300"
                      } rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                    />
                    {errors.startTime && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.startTime}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="endTime"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      End Time
                    </label>
                    <input
                      id="endTime"
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className={`w-full px-3 py-2 border ${
                        errors.endTime ? "border-red-500" : "border-gray-300"
                      } rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                    />
                    {errors.endTime && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.endTime}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleCreateAppointment}
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Create Appointment</span>
                  </button>
                </div>
                {job.appointment && (
                  <div className="mt-6 bg-gray-50 rounded-md p-4">
                    <h4 className="text-sm font-medium text-gray-800 mb-2">
                      Current Appointment
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Technician:</span>{" "}
                        {job.appointment.technician}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Start:</span>{" "}
                        {job.appointment.start_time
                          ? new Date(
                              job.appointment.start_time
                            ).toLocaleString()
                          : "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">End:</span>{" "}
                        {job.appointment.end_time
                          ? new Date(job.appointment.end_time).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "invoice" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Create Invoice
                </h3>
                <div className="space-y-4">
                  {lineItems.map((item, index) => (
                    <div key={index} className="flex space-x-2 items-end">
                      <div className="flex-1">
                        <label
                          htmlFor={`description-${index}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Description
                        </label>
                        <input
                          id={`description-${index}`}
                          type="text"
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) =>
                            updateLineItem(index, "description", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        />
                      </div>
                      <div className="w-24">
                        <label
                          htmlFor={`quantity-${index}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Quantity
                        </label>
                        <input
                          id={`quantity-${index}`}
                          type="number"
                          placeholder="0"
                          value={item.quantity}
                          onChange={(e) =>
                            updateLineItem(
                              index,
                              "quantity",
                              Number(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          min="0"
                          step="1"
                        />
                      </div>
                      <div className="w-32">
                        <label
                          htmlFor={`unit_price-${index}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Unit Price
                        </label>
                        <input
                          id={`unit_price-${index}`}
                          type="number"
                          placeholder="0.00"
                          value={item.unit_price}
                          onChange={(e) =>
                            updateLineItem(
                              index,
                              "unit_price",
                              Number(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <button
                        onClick={() => removeLineItem(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        aria-label="Remove item"
                      >
                        <svg
                          className="w-5 h-5"
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
                    </div>
                  ))}
                  {errors.lineItems && (
                    <p className="text-xs text-red-500">{errors.lineItems}</p>
                  )}
                  <div className="flex space-x-3">
                    <button
                      onClick={addLineItem}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2"
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span>Add Line Item</span>
                    </button>
                    <button
                      onClick={handleCreateInvoice}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm flex items-center space-x-2"
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
                          d="M9 12h6m-3-3v6m9-3c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"
                        />
                      </svg>
                      <span>Generate Invoice</span>
                    </button>
                  </div>
                </div>
                {job.invoice && (
                  <div className="mt-8 max-w-3xl mx-auto bg-white border border-gray-300 rounded-lg shadow-sm p-6 font-mono">
                    {/* Receipt Header */}
                    <div className="text-center border-b border-gray-200 pb-4 mb-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">
                          Invoice #{job.job.job_id}
                        </h2>
                        <div className="text-sm text-gray-600">
                          <p>Issued: {new Date().toLocaleDateString()}</p>
                          <p>
                            Status:{" "}
                            <span className="capitalize text-red-500">
                              {job.invoice.status.toLowerCase()}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-lg font-semibold text-gray-800">
                          Your Company Name
                        </p>
                        <p className="text-sm text-gray-600">
                          123 Business St, City, State, ZIP
                        </p>
                        <p className="text-sm text-gray-600">
                          contact@yourcompany.com | (123) 456-7890
                        </p>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Billed To:
                      </h3>
                      <p className="text-sm text-gray-600">
                        {job.job.customer_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {job.job.customer_email}
                      </p>
                      <p className="text-sm text-gray-600">
                        {job.job.customer_phone}
                      </p>
                    </div>

                    {/* Line Items Table */}
                    {job.invoice.lineItems.length > 0 && (
                      <div className="mb-6">
                        <table className="w-full text-sm text-left text-gray-600">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="py-2 font-medium">Description</th>
                              <th className="py-2 font-medium text-right">
                                Quantity
                              </th>
                              <th className="py-2 font-medium text-right">
                                Unit Price
                              </th>
                              <th className="py-2 font-medium text-right">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {job.invoice.lineItems.map((item, index) => (
                              <tr
                                key={index}
                                className="border-b border-gray-100"
                              >
                                <td className="py-2">{item.description}</td>
                                <td className="py-2 text-right">
                                  {item.quantity}
                                </td>
                                <td className="py-2 text-right">
                                  ${item.unit_price}
                                </td>
                                <td className="py-2 text-right">
                                  ${item.quantity * item.unit_price}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Totals Section */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-end space-x-8">
                        <div className="text-sm text-gray-600">
                          <p>Subtotal:</p>
                          <p>Tax:</p>
                          <p className="font-medium mt-2">Total Amount:</p>
                          <p>Paid Amount:</p>
                          <p className="font-medium mt-2">Remaining Balance:</p>
                        </div>
                        <div className="text-sm text-gray-800 text-right">
                          <p>${job.invoice.subtotal}</p>
                          <p>${job.invoice.tax}</p>
                          <p className="font-medium">
                            ${job.invoice.total_amount}
                          </p>
                          <p>${job.invoice.paid_amount}</p>
                          <p className="font-medium">
                            $
                            {job.invoice.total_amount - job.invoice.paid_amount}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Payment
                      job={job}
                      fetchJob={fetchJob}
                      showToast={showToast}
                    />
                    {/* Footer */}
                    <div className="mt-6 text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
                      <p>Thank you for your business!</p>
                      <p>
                        Payment due within 30 days. Please contact us for any
                        inquiries.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
