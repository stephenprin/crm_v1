import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs, updateJobStatus } from "../services/jobService";
import { useToast } from "./ToastProvider";
import { CreateJobForm } from "./CreateJobForm";

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
};

type Job = {
  id: number;
  title: string;
  description: string;
  status: "NEW" | "SCHEDULED" | "COMPLETED" | "INVOICED" | "PAID";
  created_at: string;
  customer: Customer;
};

const STATUS_COLUMNS: Array<Job["status"]> = [
  "NEW",
  "SCHEDULED",
  "COMPLETED",
  "INVOICED",
  "PAID",
];

const statusStyles: Record<Job["status"], string> = {
  NEW: "bg-blue-50 border-blue-400 text-blue-700",
  SCHEDULED: "bg-yellow-50 border-yellow-400 text-yellow-700",
  COMPLETED: "bg-green-100 border-green-300 text-green-700",
  INVOICED: "bg-purple-50 border-purple-400 text-purple-700",
  PAID: "bg-green-300 border-green-500 text-green-700",
};

export const JobsBoard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await getJobs();
      setJobs(data);
    } catch (err: any) {
      showToast({
        title: "Error",
        description: err.response?.data?.message || "Failed to fetch jobs.",
      });
      console.error(err);
    }
  };

  const handleStatusChange = async (job: Job, newStatus: Job["status"]) => {
    try {
      await updateJobStatus(job.id, newStatus);
      showToast({ title: "Success", description: `Job moved to ${newStatus}` });
      fetchJobs();
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "You cannot move the job to this status.";
      showToast({
        title: "Error",
        description: message,
      });
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden lg:block">
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800">CRM Dashboard</h2>
          <nav className="mt-6">
            <ul>
              <li className="py-2 px-4 text-gray-600 bg-gray-100 rounded">
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
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
            Jobs Board
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2"
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
              <span>New Job</span>
            </button>
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors w-48 md:w-64"
            />
          </div>
        </header>

        {/* Job Columns */}
        <main className="flex-1 p-4 md:p-6 overflow-x-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {STATUS_COLUMNS.map((status) => (
              <div
                key={status}
                className={`bg-white rounded-lg shadow-sm border ${statusStyles[status]} p-4 flex flex-col min-h-[200px] transition-all duration-200 hover:shadow-md`}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-700 capitalize">
                    {status.toLowerCase()}
                  </h3>
                  <span className="text-xs font-semibold text-gray-500">
                    {filteredJobs.filter((job) => job.status === status).length}
                  </span>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50">
                  {filteredJobs
                    .filter((job) => job.status === status)
                    .map((job) => (
                      <div
                        key={job.id}
                        className="bg-gray-50 rounded-md p-3 border border-gray-200 hover:bg-gray-100 transition-colors duration-150"
                      >
                        {/* Clickable content */}
                        <div
                          className="cursor-pointer"
                          onClick={() => navigate(`/jobs/${job.id}`)}
                        >
                          <h4 className="text-sm font-medium text-gray-800 truncate">
                            {job.title}
                          </h4>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {job.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Customer: {job.customer.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            Email: {job.customer.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(job.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Status badge (not clickable) */}
                        <span
                          className={`mt-2 text-xs font-semibold px-2 py-1 rounded-full ${statusStyles[
                            status
                          ].replace("bg-", "bg-opacity-20 text-")}`}
                        >
                          {job.status}
                        </span>

                        {/* Status dropdown (safe, no navigation) */}
                        <select
                          className="mt-3 pt-2 w-full text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors"
                          value={job.status}
                          onChange={(e) =>
                            handleStatusChange(
                              job,
                              e.target.value as Job["status"]
                            )
                          }
                        >
                          {STATUS_COLUMNS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  {filteredJobs.filter((job) => job.status === status)
                    .length === 0 && (
                    <p className="text-xs text-gray-400 text-center italic">
                      No jobs in this status
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Create Job Modal */}
        {isModalOpen && <CreateJobForm onClose={() => setIsModalOpen(false)} />}
      </div>
    </div>
  );
};
