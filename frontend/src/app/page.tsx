"use client";

import { useEffect, useState, FormEvent } from "react";

// Task type definition
interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "completed";
}

const API_URL = process.env.A_URL || "http://localhost:5000/api/tasks";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<"pending" | "in-progress" | "completed">("pending");
  const [loading, setLoading] = useState(false);

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    const res = await fetch(API_URL);
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add or update task
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (editingId) {
      await fetch(`${API_URL}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, status }),
      });
    } else {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, status }),
      });
    }
    setTitle("");
    setDescription("");
    setStatus("pending");
    setEditingId(null);
    fetchTasks();
  };

  // Edit task
  const handleEdit = (task: Task) => {
    setTitle(task.title);
    setDescription(task.description || "");
    setStatus(task.status);
    setEditingId(task._id);
  };

  // Delete task
  const handleDelete = async (id: string) => {
    setLoading(true);
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchTasks();
  };

  // Mark as completed
  const handleComplete = async (task: Task) => {
    setLoading(true);
    await fetch(`${API_URL}/${task._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, status: "completed" }),
    });
    fetchTasks();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">Personal Task Manager</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-6 w-full max-w-md flex flex-col gap-3">
        <input
          className="border rounded p-2 dark:bg-gray-700 dark:text-white"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="border rounded p-2 dark:bg-gray-700 dark:text-white"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select
          className="border rounded p-2 dark:bg-gray-700 dark:text-white"
          value={status}
          onChange={(e) => setStatus(e.target.value as Task["status"])}
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700 transition"
          disabled={loading}
        >
          {editingId ? "Update Task" : "Add Task"}
        </button>
        {editingId && (
          <button
            type="button"
            className="bg-gray-400 text-white rounded p-2 hover:bg-gray-500 transition"
            onClick={() => {
              setEditingId(null);
              setTitle("");
              setDescription("");
              setStatus("pending");
            }}
          >
            Cancel Edit
          </button>
        )}
      </form>
      <div className="w-full max-w-2xl">
        {loading ? (
          <div className="text-center text-gray-600 dark:text-gray-300">Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-300">No tasks yet.</div>
        ) : (
          <ul className="space-y-4">
            {tasks.map((task) => (
              <li key={task._id} className="bg-white dark:bg-gray-800 rounded shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className={`text-lg font-semibold ${task.status === "completed" ? "line-through text-green-600" : "text-gray-800 dark:text-gray-100"}`}>{task.title}</h2>
                  <p className="text-gray-600 dark:text-gray-300">{task.description}</p>
                  <span className={`inline-block mt-1 px-2 py-1 text-xs rounded ${task.status === "completed" ? "bg-green-200 text-green-800" : task.status === "in-progress" ? "bg-yellow-200 text-yellow-800" : "bg-gray-200 text-gray-800"}`}>{task.status}</span>
                </div>
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition disabled:opacity-50"
                    onClick={() => handleComplete(task)}
                    disabled={task.status === "completed" || loading}
                  >
                    Complete
                  </button>
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                    onClick={() => handleEdit(task)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    onClick={() => handleDelete(task._id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
