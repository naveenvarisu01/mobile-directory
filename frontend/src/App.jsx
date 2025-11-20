import { useEffect, useMemo, useState } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function App() {
  const [states, setStates] = useState([]);
  const [addForm, setAddForm] = useState({
    text: "",
  });
  const [searchForm, setSearchForm] = useState({
    place: "",
    district: "",
    state: "",
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`${backendUrl}/states`)
      .then((r) => r.json())
      .then(setStates)
      .catch(() => setStates(["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana"]));
  }, []);

  const canAdd = useMemo(() => {
    return addForm.text.trim().length > 10;
  }, [addForm]);

  const onAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((s) => ({ ...s, [name]: value }));
  };

  const onSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchForm((s) => ({ ...s, [name]: value }));
  };

  const addNumber = async () => {
    setMsg("");
    if (!canAdd) {
      setMsg("Please fill all fields correctly.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || (data.errors && data.errors.join(", ")) || "Failed to add");
      } else {
        setMsg("Number added!");
        setAddForm({ text: "" });
      }
    } catch {
      setMsg("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const search = async (filters = searchForm) => {
    setMsg("");
    setLoading(true);
    try {
      const qs = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters)
            .filter(([_, v]) => v && v.trim())
            .map(([k, v]) => [k, v.trim()])
        )
      ).toString();
      const res = await fetch(`${backendUrl}/search?${qs}`);
      const data = await res.json();
      setResults(data);
      if (data.length === 0) setMsg("No results found.");
    } catch {
      setMsg("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const showAll = () => {
    setSearchForm({ place: "", district: "", state: "" });
    search({ place: "", district: "", state: "" });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setMsg(`Copied ${text} to clipboard!`);
      setTimeout(() => setMsg(""), 2000);
    }).catch(() => {
      setMsg("Failed to copy.");
    });
  };

  const deleteNumber = async (number) => {
    if (!confirm(`Are you sure you want to delete ${number}?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/delete/${number}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMsg("Number deleted successfully.");
        // Refresh results if we are currently searching
        if (results.length > 0) {
          search();
        }
      } else {
        const data = await res.json();
        setMsg(data.error || "Failed to delete.");
      }
    } catch {
      setMsg("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Mobile Directory</h1>
        <p className="label">Add mobile number</p>
        <p className="label">Add mobile number with place (e.g., "9876543210 Gandhipuram")</p>
        <textarea
          className="input"
          name="text"
          placeholder="Enter number and place..."
          value={addForm.text}
          onChange={onAddChange}
          rows={3}
        />
        <button className="button" onClick={addNumber} disabled={loading || !canAdd}>
          Add
        </button>
      </div>

      <div className="card">
        <p className="label">Search by place, district, or state</p>
        <input
          className="input"
          name="place"
          placeholder="Place"
          value={searchForm.place}
          onChange={onSearchChange}
        />
        <input
          className="input"
          name="district"
          placeholder="District"
          value={searchForm.district}
          onChange={onSearchChange}
        />
        <select
          className="select"
          name="state"
          value={searchForm.state}
          onChange={onSearchChange}
        >
          <option value="">Any state</option>
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="button secondary" onClick={() => search()} disabled={loading}>
          Search
        </button>
        <button className="button" style={{ backgroundColor: "#64748b" }} onClick={showAll} disabled={loading}>
          Show All
        </button>

        {msg && <p style={{ marginTop: "0.5rem" }}>{msg}</p>}
        <ul className="list">
          {results.map((r, i) => (
            <li className="item" key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <strong>{r.number}</strong>
                  <button
                    className="button"
                    style={{ padding: "0.1rem 0.4rem", fontSize: "0.7rem", backgroundColor: "#cbd5e1", color: "#334155", margin: 0 }}
                    onClick={() => copyToClipboard(r.number)}
                    title="Copy Number"
                  >
                    Copy
                  </button>
                </div>
                <div style={{ fontSize: "0.9rem", color: "#475569", marginTop: "0.2rem" }}>
                  {r.place} <span style={{ color: "#94a3b8" }}>• {r.district}, {r.state}</span>
                  {r.created_at && (
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.1rem" }}>
                      Added: {new Date(r.created_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
              <button
                className="button"
                style={{ backgroundColor: "#ff4444", marginLeft: "1rem", padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                onClick={() => deleteNumber(r.number)}
                disabled={loading}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
