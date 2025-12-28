import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { serverUrl } from "../../config";
import Container from "../components/Container";
import {
  FaEnvelope,
  FaEye,
  FaTrash,
  FaSync,
} from "react-icons/fa";
import SmallLoader from "../components/SmallLoader";

const Contacts = () => {
  //  ADMIN TOKEN (FIX)
  const token = localStorage.getItem("token");

  const [contacts, setContacts] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    unread: 0,
    read: 0,
    replied: 0,
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [viewContact, setViewContact] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  /*  FETCH CONTACTS */
  const fetchContacts = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const res = await axios.get(
        `${serverUrl}/api/contact/admin/all`,
        {
          params: { search, status },
          headers: {
            Authorization: `Bearer ${token}`, // ✅ CORRECT
          },
        }
      );

      if (res.data.success) {
        setContacts(res.data.data);
        setCounts(res.data.counts);
      } else {
        toast.error("Failed to load contacts");
      }
    } catch (error) {
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [search, status]);

  /*  UPDATE STATUS  */
  const updateStatus = async (id, newStatus) => {
    try {
      setActionLoading(true);

      await axios.put(
        `${serverUrl}/api/contact/admin/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchContacts();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  /*  DELETE CONTACT */
  const deleteContact = async (id) => {
    if (!window.confirm("Delete this message?")) return;

    try {
      setActionLoading(true);

      await axios.delete(
        `${serverUrl}/api/contact/admin/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Message deleted");
      fetchContacts();
    } catch {
      toast.error("Failed to delete message");
    } finally {
      setActionLoading(false);
    }
  };

  /* NO TOKEN GUARD  */
  if (!token) {
    return (
      <Container>
        <p className="text-center text-red-600 font-semibold">
          Admin login required
        </p>
      </Container>
    );
  }

  return (
    <Container>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Contact Messages</h1>
          <p className="text-gray-500">
            Manage customer inquiries and support requests
          </p>
        </div>

        <button
          onClick={fetchContacts}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <FaSync /> Refresh
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total" value={counts.total} />
        <StatCard label="Unread" value={counts.unread} color="red" />
        <StatCard label="Read" value={counts.read} color="blue" />
        <StatCard label="Replied" value={counts.replied} color="green" />
      </div>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search messages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border px-4 py-2 rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
        </select>
      </div>

      {/* desktop table */}
      <div className="hidden md:block bg-white border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <SmallLoader />
          </div>
        ) : contacts.length === 0 ? (
          <p className="p-6 text-center text-gray-500">
            No messages found
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left">Sender</th>
                <th className="p-3 text-left">Subject</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c._id} className="border-b">
                  <td className="p-3">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.email}</p>
                  </td>

                  <td className="p-3">{c.subject}</td>

                  <td className="p-3">
                    <StatusBadge status={c.status} />
                  </td>

                  <td className="p-3">
                    {new Date(c.createdAt).toLocaleString()}
                  </td>

                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setViewContact(c);
                        if (c.status === "unread") {
                          updateStatus(c._id, "read");
                        }
                      }}
                      className="text-blue-600"
                    >
                      <FaEye />
                    </button>

                    <button
                      onClick={() => deleteContact(c._id)}
                      className="text-red-600"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="p-6 text-center">
            <SmallLoader />
          </div>
        ) : contacts.length === 0 ? (
          <p className="text-center text-gray-500">
            No messages found
          </p>
        ) : (
          contacts.map((c) => (
            <div
              key={c._id}
              className="bg-white border rounded-lg p-4 space-y-3"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.email}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>

              {/* SUBJECT */}
              <p className="text-sm font-medium text-gray-800">
                {c.subject}
              </p>

              {/* DATE */}
              <p className="text-xs text-gray-500">
                {new Date(c.createdAt).toLocaleString()}
              </p>

              {/* ACTIONS */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setViewContact(c);
                    if (c.status === "unread") {
                      updateStatus(c._id, "read");
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2 rounded-lg"
                >
                  <FaEye /> View
                </button>

                <button
                  onClick={() => deleteContact(c._id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* VIEW MODAL */}
      {viewContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold mb-2">
              {viewContact.subject}
            </h2>

            <p className="text-sm text-gray-500 mb-4">
              From: {viewContact.name} ({viewContact.email})
            </p>

            <p className="text-gray-700 whitespace-pre-line">
              {viewContact.message}
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() =>
                  updateStatus(viewContact._id, "replied")
                }
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Mark Replied
              </button>

              <button
                onClick={() => setViewContact(null)}
                className="border px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

/* ================= REUSABLE COMPONENTS ================= */

const StatCard = ({ label, value, color = "blue" }) => {
  const colors = {
    blue: "text-blue-600",
    red: "text-red-600",
    green: "text-green-600",
  };

  return (
    <div className="bg-white border rounded-lg p-4 flex items-center gap-4">
      <FaEnvelope className={`text-2xl ${colors[color]}`} />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    unread: "bg-red-100 text-red-600",
    read: "bg-blue-100 text-blue-600",
    replied: "bg-green-100 text-green-600",
  };

  return (
    <span className={`px-2 py-1 rounded text-xs ${map[status]}`}>
      {status}
    </span>
  );
};

export default Contacts;
