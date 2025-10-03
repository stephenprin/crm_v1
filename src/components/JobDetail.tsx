import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getJobById } from "../services/jobService";
import { createAppointment } from "../services/appointmentService";
import {
  createInvoice,
  type InvoiceLineItem,
} from "../services/invoiceService";
import { useToast } from "./ToastProvider";

interface Job {
  id: number;
  title: string;
  description: string;
  job_status: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  appointment?: {
    technician: string;
    start: string;
    end: string;
  };
  invoice?: {
    status: string;
    totalAmount: number;
    paidAmount: number;
    remainingBalance: number;
  };
}

export const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState<
    "details" | "appointment" | "invoice"
  >("details");
  const { showToast } = useToast();

  useEffect(() => {
    if (!id) return;
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const data = await getJobById(Number(id));
      setJob(data);
    } catch (err) {
      showToast({
        title: "Error",
        description: "Failed to fetch job details.",
      });
      console.error(err);
    }
  };

  // Appointment form state
  const [technician, setTechnician] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Invoice form state
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);

  const handleCreateAppointment = async () => {
    if (!technician || !startTime || !endTime) {
      showToast({
        title: "Missing fields",
        description: "Please fill all fields.",
      });
      return;
    }

    try {
      await createAppointment(job.id, {
        technician,
        start_time: startTime,
        end_time: endTime,
      });
      showToast({
        title: "Appointment Created",
        description: "Appointment scheduled successfully.",
      });
      fetchJob();
      setTechnician("");
      setStartTime("");
      setEndTime("");
    } catch (err) {
      showToast({
        title: "Error",
        description: "Failed to create appointment.",
      });
      console.error(err);
    }
  };

  const handleCreateInvoice = async () => {
    if (lineItems.length === 0) {
      showToast({
        title: "No line items",
        description: "Add at least one line item.",
      });
      return;
    }

    try {
      await createInvoice(job.id, lineItems);
      showToast({
        title: "Invoice Created",
        description: "Invoice generated successfully.",
      });
      fetchJob();
      setLineItems([]);
    } catch (err) {
      showToast({ title: "Error", description: "Failed to create invoice." });
      console.error(err);
    }
  };

  if (!job) return <div>Loading...</div>;

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">{job.title}</h2>
      <div className="flex space-x-4">
        {(
          ["details", "appointment", "invoice"] as Array<
            "details" | "appointment" | "invoice"
          >
        ).map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "details" && (
        <div className="space-y-2">
          <h3 className="font-semibold">Customer Info</h3>
          <p>Name: {job.customer?.name}</p>
          <p>Email: {job.customer?.email}</p>
          <p>Phone: {job.customer?.phone}</p>
          <h3 className="font-semibold mt-4">Job Details</h3>
          <p>{job.description}</p>
          <p>Status: {job.job_status}</p>
        </div>
      )}

      {activeTab === "appointment" && (
        <div className="space-y-2">
          <h3 className="font-semibold">Schedule Appointment</h3>
          <input
            type="text"
            placeholder="Technician"
            value={technician}
            onChange={(e) => setTechnician(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
          <input
            type="datetime-local"
            placeholder="Start"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
          <input
            type="datetime-local"
            placeholder="End"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
          <button
            onClick={handleCreateAppointment}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create Appointment
          </button>

          {job.appointment && (
            <div className="mt-4 border p-2 rounded">
              <p>Technician: {job.appointment.technician}</p>
              <p>Start: {job.appointment.start}</p>
              <p>End: {job.appointment.end}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "invoice" && (
        <div className="space-y-2">
          <h3 className="font-semibold">Invoice</h3>
          <button
            onClick={handleCreateInvoice}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Generate Invoice
          </button>

          {job.invoice && (
            <div className="mt-4 border p-2 rounded">
              <p>Status: {job.invoice.status}</p>
              <p>Total: {job.invoice.totalAmount}</p>
              <p>Paid: {job.invoice.paidAmount}</p>
              <p>Remaining: {job.invoice.remainingBalance}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
