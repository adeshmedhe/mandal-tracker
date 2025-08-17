import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase.jsx";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
} from "firebase/firestore";

function formatDateTime(iso) {
  const date = new Date(iso);
  return (
    date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    " " +
    date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [donations, setDonations] = useState([]);
  const [search, setSearch] = useState("");

  // Fetch user data
  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserDetails({ ...docSnap.data(), lastLogin: user.metadata.lastSignInTime });
      }
    });
  };

  // Fetch donations
  const fetchDonations = async () => {
    const q = query(collection(db, "donations"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    setDonations(
      querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );
  };

  useEffect(() => {
    fetchUserData();
    fetchDonations();
    // eslint-disable-next-line
  }, []);

  async function handleLogout() {
    try {
      await auth.signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  }

  const handleAddDonation = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "donations"), {
        donorName,
        receiverName: receiverName || (userDetails ? userDetails.firstName : ""),
        amount: Number(amount),
        date: new Date().toISOString(),
      });
      setShowModal(false);
      setDonorName("");
      setReceiverName("");
      setAmount("");
      await fetchDonations();
      alert("Donation added!");
    } catch (err) {
      alert("Error adding donation: " + err.message);
    }
    setLoading(false);
  };

  // Filter donations by search
  const filteredDonations = donations.filter((d) => {
    const s = search.toLowerCase();
    return (
      d.donorName.toLowerCase().includes(s) ||
      d.receiverName.toLowerCase().includes(s) ||
      String(d.amount).includes(s)
    );
  });

  // Delete donation
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this donation?")) return;
    await deleteDoc(doc(db, "donations", id));
    await fetchDonations();
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #f4f7fb 60%, #e6edfa 100%)",
        minHeight: "100vh",
        padding: "48px 0",
      }}
    >
      {userDetails ? (
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            background: "none",
            padding: "0 24px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#fff",
              borderRadius: 18,
              padding: "36px 48px",
              marginBottom: 40,
              boxShadow: "0 4px 32px #0001",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
              <img
                src=".src/assets/ganpati-bappa.png"
                width={72}
                height={72}
                style={{ borderRadius: "50%", background: "#e3eaff" }}
                alt="User"
              />
              <div>
                <h2 style={{ margin: 0, fontWeight: 800, fontSize: 28 }}>
                  Welcome, {userDetails.firstName}
                </h2>
                <div style={{ color: "#555", fontSize: 17 }}>{userDetails.email}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, color: "#888" }}>Last Login</div>
              <div style={{ fontSize: 16, marginBottom: 10, fontWeight: 500 }}>
                {userDetails.lastLogin ? formatDateTime(userDetails.lastLogin) : ""}
              </div>
              <button
                className="btn btn-danger"
                style={{
                  fontWeight: 700,
                  fontSize: 17,
                  padding: "8px 22px",
                  borderRadius: 8,
                  background: "#f44336",
                  border: "none",
                  color: "#fff",
                  boxShadow: "0 2px 8px #f4433622",
                  cursor: "pointer",
                }}
                onClick={handleLogout}
              >
                <span style={{ marginRight: 8 }}>↩</span>Logout
              </button>
            </div>
          </div>

          {/* Add Donation + Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 32,
              gap: 20,
              background: "#fff",
              borderRadius: 14,
              boxShadow: "0 2px 12px #0001",
              padding: "24px 32px",
            }}
          >
            <button
              className="btn btn-success"
              style={{
                fontSize: 20,
                padding: "12px 36px",
                borderRadius: 8,
                fontWeight: 700,
                background: "#22c55e",
                color: "#fff",
                border: "none",
                boxShadow: "0 2px 8px #22c55e22",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onClick={() => setShowModal(true)}
            >
              + Add Donation
            </button>
            <input
              type="text"
              placeholder="🔍 Search donations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                padding: "12px 22px",
                borderRadius: 8,
                border: "1px solid #e0e7ef",
                fontSize: 18,
                background: "#f7fafd",
                boxShadow: "0 1px 4px #0001",
                outline: "none",
                transition: "border 0.2s",
              }}
            />
          </div>

          {/* Donation Table */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 4px 24px #0001",
              padding: 0,
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "28px 36px 0 36px" }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Donation Records</h3>
              <div style={{ color: "#888", fontSize: 16, marginBottom: 18 }}>
                Manage and track all donation transactions
              </div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 17 }}>
              <thead>
                <tr style={{ background: "#f7f9fb", textAlign: "left" }}>
                  <th style={{ padding: "16px 36px" }}>DONOR NAME</th>
                  <th>RECEIVER NAME</th>
                  <th>AMOUNT</th>
                  <th>DATE &amp; TIME</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: 40, color: "#aaa" }}>
                      No donations found.
                    </td>
                  </tr>
                ) : (
                  filteredDonations.map((d) => (
                    <tr key={d.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "16px 36px", display: "flex", alignItems: "center", gap: 14 }}>
                        <span
                          style={{
                            display: "inline-block",
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "#e3eaff",
                            textAlign: "center",
                            lineHeight: "32px",
                            fontWeight: 700,
                            color: "#3a6ee8",
                            fontSize: 18,
                          }}
                        >
                          {d.donorName[0]?.toUpperCase() || "?"}
                        </span>
                        <span style={{ fontWeight: 700 }}>{d.donorName}</span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{d.receiverName}</td>
                      <td style={{ color: "#16a34a", fontWeight: 800 }}>
                        ${Number(d.amount).toFixed(2)}
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {formatDateTime(d.date)}
                      </td>
                      <td>
                        <button
                          className="btn btn-primary"
                          style={{
                            marginRight: 10,
                            fontSize: 15,
                            padding: "6px 18px",
                            borderRadius: 6,
                            background: "#3b82f6",
                            color: "#fff",
                            border: "none",
                            fontWeight: 600,
                            cursor: "not-allowed",
                            opacity: 0.7,
                          }}
                          disabled
                        >
                          <span role="img" aria-label="edit">✏️</span> Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{
                            fontSize: 15,
                            padding: "6px 18px",
                            borderRadius: 6,
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                          onClick={() => handleDelete(d.id)}
                        >
                          <span role="img" aria-label="delete">🗑️</span> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Modal for adding donation */}
          {showModal && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}
            >
              <form
                onSubmit={handleAddDonation}
                style={{
                  background: "#fff",
                  padding: 36,
                  borderRadius: 14,
                  minWidth: 380,
                  boxShadow: "0 4px 32px #0002",
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                }}
              >
                <h3 style={{ margin: 0, fontWeight: 800 }}>Add Donation</h3>
                <label style={{ fontWeight: 700 }}>
                  Donor Name:
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      marginTop: 6,
                      padding: 10,
                      borderRadius: 7,
                      border: "1px solid #ddd",
                      fontSize: 17,
                    }}
                  />
                </label>
                <label style={{ fontWeight: 700 }}>
                  Receiver Name:
                  <input
                    type="text"
                    value={receiverName || userDetails.firstName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder={userDetails.firstName}
                    style={{
                      width: "100%",
                      marginTop: 6,
                      padding: 10,
                      borderRadius: 7,
                      border: "1px solid #ddd",
                      fontSize: 17,
                    }}
                  />
                </label>
                <label style={{ fontWeight: 700 }}>
                  Amount:
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      marginTop: 6,
                      padding: 10,
                      borderRadius: 7,
                      border: "1px solid #ddd",
                      fontSize: 17,
                    }}
                  />
                </label>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                    style={{
                      padding: "8px 18px",
                      borderRadius: 6,
                      background: "#e5e7eb",
                      color: "#222",
                      border: "none",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading}
                    style={{
                      padding: "8px 18px",
                      borderRadius: 6,
                      background: "#22c55e",
                      color: "#fff",
                      border: "none",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {loading ? "Adding..." : "Add"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Profile;