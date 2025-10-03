import React, { useState } from "react";
import { useToast } from "./ToastProvider";
import { createJob } from "@/services/jobService";

export const CreateJobForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [customerName, setCustomerName] = useState("");
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createJob({ title, description, customer_id: 1 });
      toast.showToast({
        title: "Success",
        description: "Job created successfully",
      });
      setTitle("");
      setDescription("");
      setCustomerName("");
    } catch {
      toast.showToast({
        title: "Error",
        description: "Could not create job",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded shadow max-w-md"
    >
      <input
        type="text"
        placeholder="Job Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
        required
      />
      <input
        type="text"
        placeholder="Customer Name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
        required
      />
      <textarea
        placeholder="Job Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Create Job
      </button>
    </form>
  );
};
