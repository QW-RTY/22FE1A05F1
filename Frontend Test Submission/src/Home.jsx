import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ShortUrlLink from "./ShortUrlLink";

const baseUrl = "https://short.url/";

const generateRandomCode = (length = 6) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function Home({ shortUrls, setShortUrls }) {
  const [longUrl, setLongUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [expiryTime, setExpiryTime] = useState("");
  const [error, setError] = useState("");
  const timers = useRef({});

  const createShortUrl = () => {
    setError("");
    if (!longUrl.trim()) {
      setError("Long URL is required.");
      return;
    }

    let code = shortCode.trim();

    if (!code) {
      do {
        code = generateRandomCode();
      } while (shortUrls.find((u) => u.code === code));
    } else {
      if (shortUrls.find((u) => u.code === code)) {
        setError("Short code already exists. Please choose another.");
        return;
      }
    }

    let expiryMinutes = parseInt(expiryTime);
    if (isNaN(expiryMinutes) || expiryMinutes <= 0) {
      expiryMinutes = 30;
    }

    const expiryTimestamp = Date.now() + expiryMinutes * 60000;

    const newEntry = {
      longUrl,
      code,
      expiryTimestamp,
      createdAt: Date.now(),
      clicks: [],
    };

    setShortUrls((prev) => [...prev, newEntry]);
    setLongUrl("");
    setShortCode("");
    setExpiryTime("");

    timers.current[code] = setTimeout(() => {
      setShortUrls((prev) => prev.filter((u) => u.code !== code));
      delete timers.current[code];
    }, expiryMinutes * 60000);
  };

  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: "20px auto", fontFamily: "Arial" }}>
      <h2>URL Shortener</h2>
      <nav>
        <Link to="/stats">View Statistics</Link>
      </nav>

      <div style={{ marginBottom: 10 }}>
        <label>
          Long URL*:
          <input
            type="url"
            placeholder="Enter long URL"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 5 }}
          />
        </label>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>
          Short Code (optional):
          <input
            type="text"
            placeholder="Enter short code"
            value={shortCode}
            onChange={(e) => setShortCode(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 5 }}
          />
        </label>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>
          Expiry Time in minutes (optional, default 30):
          <input
            type="number"
            min="1"
            placeholder="Enter expiry time"
            value={expiryTime}
            onChange={(e) => setExpiryTime(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 5 }}
          />
        </label>
      </div>

      <button onClick={createShortUrl} style={{ padding: "10px 20px" }}>
        Create
      </button>

      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}

      <div style={{ marginTop: 20 }}>
        {shortUrls.map(({ code, expiryTimestamp }) => {
          const remaining = Math.max(0, expiryTimestamp - Date.now());
          const minutes = Math.floor(remaining / 60000);
          const seconds = Math.floor((remaining % 60000) / 1000);

          return (
            <div
              key={code}
              style={{
                background: "#f0f0f0",
                padding: 10,
                borderRadius: 4,
                marginBottom: 10,
              }}
            >
              <ShortUrlLink code={code} />
              <p>
                Expires in: {minutes} min {seconds} sec
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
