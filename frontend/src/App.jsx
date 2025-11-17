import { useEffect, useMemo, useState } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function App() {
  const [states, setStates] = useState([]);
  const [addForm, setAddForm] = useState({
    number: "",
    place: "",
    district: "",
    state: "",
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
    return (
      /^[6-9]\d{9}$/.test(addForm.number.trim()) &&
      addForm.place.trim() &&
      addForm.district.trim() &&
      addForm.state.trim()
    );
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
        setAddForm({ number: "", place: "", district: "", state: "" });
      }
    } catch {
      setMsg("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const search = async () => {
    setMsg("");
    setLoading(true);
    try {
      const qs = new URLSearchParams(
        Object.fromEntries(
          Object.entries(searchForm)
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

  return (
    <div className="container">
      <div className="card">
        <h1>Mobile Directory</h1>
        <p className="label">Add mobile number</p>
        <input
          className="input"
          name="number"
          placeholder="10-digit mobile number"
          value={addForm.number}
          onChange={onAddChange}
        />
        <input
          className="input"
          name="place"
          placeholder="Place (e.g., Gandhipuram)"
          value={addForm.place}
          onChange={onAddChange}
        />
        <input
          className="input"
          name="district"
          placeholder="District (e.g., Coimbatore)"
          value={addForm.district}
          onChange={onAddChange}
        />
        <select
          className="select"
          name="state"
          value={addForm.state}
          onChange={onAddChange}
        >
          <option value="">Select state</option>
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
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
        <button className="button secondary" onClick={search} disabled={loading}>
          Search
        </button>

        {msg && <p style={{ marginTop: "0.5rem" }}>{msg}</p>}
        <ul className="list">
          {results.map((r, i) => (
            <li className="item" key={i}>
              <strong>{r.number}</strong> — {r.place}, {r.district}, {r.state}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
