import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const baseUrl = "https://short.url/";

// Util: get referrer
const getReferrer = () => document.referrer || "Direct";

// Util: fetch geo location from IP API
async function getGeoLocation() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return "Unknown location";
    const data = await res.json();
    return `${data.city || "Unknown City"}, ${data.region || ""}, ${
      data.country_name || "Unknown Country"
    }`;
  } catch {
    return "Unknown location";
  }
}

export default function Stats({ shortUrls, setShortUrls }) {
  const [loadingGeo, setLoadingGeo] = useState(false);

  useEffect(() => {
    async function handleClickEvent(e) {
      const code = e.detail.code;
      setLoadingGeo(true);
      const geo = await getGeoLocation();
      setLoadingGeo(false);

      setShortUrls((prev) =>
        prev.map((u) => {
          if (u.code === code) {
            return {
              ...u,
              clicks: [
                ...u.clicks,
                {
                  timestamp: new Date().toISOString(),
                  source: getReferrer(),
                  geo,
                },
              ],
            };
          }
          return u;
        })
      );
    }

    window.addEventListener("shortUrlClicked", handleClickEvent);

    return () => {
      window.removeEventListener("shortUrlClicked", handleClickEvent);
    };
  }, [setShortUrls]);

  return (
    <div style={{ maxWidth: 700, margin: "20px auto", fontFamily: "Arial" }}>
      <h2>Statistics</h2>
      <nav>
        <Link to="/">Go Back to URL Shortener</Link>
      </nav>

      {loadingGeo && <p>Updating click location data...</p>}

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 20,
        }}
      >
        <thead>
          <tr>
            <th
              style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}
            >
              Short URL
            </th>
            <th
              style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}
            >
              Expiry Date/Time
            </th>
            <th
              style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}
            >
              Number of Clicks
            </th>
            <th
              style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}
            >
              Click Details
            </th>
          </tr>
        </thead>
        <tbody>
          {shortUrls.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: 10 }}>
                No short URLs created yet.
              </td>
            </tr>
          )}

          {shortUrls.map(({ code, expiryTimestamp, clicks }) => (
            <tr key={code}>
              <td
                style={{
                  border: "1px solid #ccc",
                  padding: 8,
                  verticalAlign: "top",
                }}
              >
                <a href={baseUrl + code} target="_blank" rel="noreferrer">
                  {baseUrl + code}
                </a>
              </td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                {new Date(expiryTimestamp).toLocaleString()}
              </td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                {clicks.length}
              </td>
              <td
                style={{
                  border: "1px solid #ccc",
                  padding: 8,
                  maxHeight: 150,
                  overflowY: "auto",
                }}
              >
                {clicks.length === 0 && <i>No clicks yet</i>}
                {clicks.map(({ timestamp, source, geo }, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginBottom: 8,
                      borderBottom: "1px solid #eee",
                      paddingBottom: 4,
                    }}
                  >
                    <div>
                      <b>Timestamp:</b> {new Date(timestamp).toLocaleString()}
                    </div>
                    <div>
                      <b>Source:</b> {source}
                    </div>
                    <div>
                      <b>Location:</b> {geo}
                    </div>
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
