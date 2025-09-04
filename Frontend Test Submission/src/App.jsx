import React, { useState } from "react";
import './App.css'
// Helper functions
const generateShortCode = (length = 6) => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const getCoarseLocation = () => "Unknown Location";

const formatDateOnly = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString();
};

const getEndOfDayTimestamp = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
};

function App() {
  const [page, setPage] = useState("home"); // 'home' or 'stats'

  const [longUrl, setLongUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [expiryDateInput, setExpiryDateInput] = useState(""); // yyyy-mm-dd
  const [shortenedUrls, setShortenedUrls] = useState([]);
  const [lastCreated, setLastCreated] = useState(null); // store last created URL info

  const handleCreate = () => {
    if (!longUrl.trim()) {
      alert("Long URL is mandatory");
      return;
    }

    let expiryDateTimestamp;

    if (expiryDateInput) {
      expiryDateTimestamp = getEndOfDayTimestamp(expiryDateInput);
      if (expiryDateTimestamp <= Date.now()) {
        alert("Expiry date must be in the future");
        return;
      }
    } else {
      expiryDateTimestamp = Date.now() + 30 * 60 * 1000; // 30 mins from now
    }

    let code = shortCode.trim();
    if (code === "") {
      do {
        code = generateShortCode();
      } while (shortenedUrls.find((u) => u.code === code));
    } else {
      if (shortenedUrls.find((u) => u.code === code)) {
        alert("Short code already taken. Please choose another.");
        return;
      }
    }

    const newUrl = {
      longUrl: longUrl.trim(),
      code,
      expiryDate: expiryDateTimestamp,
      clicks: 0,
      clickDetails: [],
    };

    setShortenedUrls((prev) => [...prev, newUrl]);
    setLastCreated(newUrl); // save last created URL info

    // Clear form
    setLongUrl("");
    setShortCode("");
    setExpiryDateInput("");
  };

  const handleShortUrlClick = (code) => {
    const now = Date.now();

    setShortenedUrls((prev) =>
      prev.map((u) => {
        if (u.code === code) {
          if (u.expiryDate < now) {
            alert("This link has expired");
            return u;
          }
          const clickDetail = {
            timestamp: now,
            source: document.referrer || "Direct",
            location: getCoarseLocation(),
          };
          return {
            ...u,
            clicks: u.clicks + 1,
            clickDetails: [...u.clickDetails, clickDetail],
          };
        }
        return u;
      })
    );

    const url = shortenedUrls.find((u) => u.code === code)?.longUrl;
    if (url) window.open(url, "_blank");
  };

  // Navbar component with CSS class
  const Navbar = () => (
    <nav className="navbar">
      <button
        onClick={() => setPage("home")}
        className={page === "home" ? "active" : ""}
      >
        Home
      </button>
      <button
        onClick={() => setPage("stats")}
        className={page === "stats" ? "active" : ""}
      >
        Statistics
      </button>
    </nav>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "Arial",
        padding: "20px",
        boxSizing: "border-box",
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      <Navbar />

      {page === "home" && (
        <div
          style={{
            maxWidth: 500,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          {/* Removed heading as requested */}

          <div>
            <label>Long URL (mandatory):</label>
            <br />
            <input
              type="url"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="https://example.com"
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div>
            <label>Short Code (optional):</label>
            <br />
            <input
              type="text"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value)}
              placeholder="Custom code"
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div>
            <label>
              Expiry Date (optional):
            </label>
            <br />
            <input
              type="date"
              value={expiryDateInput}
              onChange={(e) => setExpiryDateInput(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <button
            onClick={handleCreate}
            style={{
              padding: "10px 20px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Create
          </button>

          {lastCreated && (
            <div
              style={{
                marginTop: 30,
                padding: 15,
                border: "1px solid #ccc",
                borderRadius: 6,
                backgroundColor: "#f0f8ff",
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: 10 }}>Created Short URL</h3>
              <p>
                <strong>Original URL:</strong>{" "}
                <a href={lastCreated.longUrl} target="_blank" rel="noreferrer">
                  {lastCreated.longUrl}
                </a>
              </p>
              <p>
                <strong>Short URL:</strong>{" "}
                <a
                  href="#!"
                  onClick={() => handleShortUrlClick(lastCreated.code)}
                  style={{ color: "blue", textDecoration: "underline" }}
                >
                  {window.location.origin}/{lastCreated.code}
                </a>
              </p>
              <p>
                <strong>Expiry Date:</strong> {formatDateOnly(lastCreated.expiryDate)}
              </p>
            </div>
          )}
        </div>
      )}

      {page === "stats" && (
        <>
          <h1 style={{ textAlign: "center" }}>Statistics</h1>

          {shortenedUrls.length === 0 ? (
            <p style={{ textAlign: "center" }}>No shortened URLs created yet.</p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "25px",
                maxWidth: 700,
                margin: "0 auto",
              }}
            >
              {shortenedUrls.map((u) => (
                <div
                  key={u.code}
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: 6,
                    padding: 15,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <p>
                    <strong>Original URL:</strong>{" "}
                    <a href={u.longUrl} target="_blank" rel="noreferrer">
                      {u.longUrl}
                    </a>
                  </p>
                  <p>
                    <strong>Short URL:</strong>{" "}
                    <a
                      href="#!"
                      onClick={() => handleShortUrlClick(u.code)}
                      style={{ color: "blue", textDecoration: "underline" }}
                    >
                      {window.location.origin}/{u.code}
                    </a>
                  </p>
                  <p>
                    <strong>Expiry Date:</strong> {formatDateOnly(u.expiryDate)}
                  </p>
                  <p>
                    <strong>Total Clicks:</strong> {u.clicks}
                  </p>

                  <div>
                    <strong>Click Details:</strong>
                    {u.clickDetails.length === 0 ? (
                      <p style={{ fontStyle: "italic" }}>No clicks yet</p>
                    ) : (
                      <div
                        style={{
                          maxHeight: 200,
                          overflowY: "auto",
                          marginTop: 8,
                          border: "1px solid #ddd",
                          borderRadius: 4,
                          padding: 8,
                          backgroundColor: "white",
                          fontSize: 12,
                        }}
                      >
                        {u.clickDetails.map((click, i) => (
                          <div
                            key={i}
                            style={{
                              borderBottom:
                                i !== u.clickDetails.length - 1
                                  ? "1px solid #eee"
                                  : "none",
                              padding: "6px 0",
                            }}
                          >
                            <div>
                              <strong>Timestamp:</strong>{" "}
                              {new Date(click.timestamp).toLocaleString()}
                            </div>
                            <div>
                              <strong>Source:</strong> {click.source}
                            </div>
                            <div>
                              <strong>Location:</strong> {click.location}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
