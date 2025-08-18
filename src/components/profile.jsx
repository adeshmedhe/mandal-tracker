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
import "./profile.css";
import ganpatiBappa from "../assets/ganpati-bappa.png";
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
  }, []);

  useEffect(() => {
    let timer;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        auth.signOut();
        window.location.href = "/login";
      }, 30 * 60 * 1000);
    };
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    resetTimer();
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
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
  const filteredDonations = donations.filter((d) => {
    const s = search.toLowerCase();
    return (
      d.donorName.toLowerCase().includes(s) ||
      d.receiverName.toLowerCase().includes(s) ||
      String(d.amount).includes(s)
    );
  });
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this donation?")) return;
    await deleteDoc(doc(db, "donations", id));
    await fetchDonations();
  };
  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);
  const paginatedDonations = filteredDonations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #f4f7fb 60%, #e6edfa 100%)",
        minHeight: "100vh",
        padding: "48px 0",
      }}
    >
      {userDetails ? (
        <div className="profile-container">
          {/* Header */}
          <div className="profile-header" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fff",
            borderRadius: 18,
            padding: "36px 48px",
            marginBottom: 40,
            boxShadow: "0 4px 32px #0001",
            flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
              <img src={ganpatiBappa} alt="Ganpati Bappa" style={{ width: 100 ,height: 100, marginRight: 16 }} />
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
          <div className="profile-table" style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 24px #0001",
            padding: 0,
            overflow: "auto",
          }}>
            <div style={{ padding: "28px 36px 0 36px" }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Donation Records</h3>
              <div style={{ color: "#888", fontSize: 16, marginBottom: 18 }}>
                Manage and track all donation transactions
              </div>
              {/* Total Amount */}
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", margin: "16px 0 8px 0" }}>
                <span style={{ fontWeight: 700, fontSize: 18 }}>
                  Total: ₹
                  {filteredDonations.reduce((sum, d) => sum + Number(d.amount), 0).toFixed(2)}
                </span>
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
                {paginatedDonations.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: 40, color: "#aaa" }}>
                      No donations found.
                    </td>
                  </tr>
                ) : (
                  paginatedDonations.map((d) => (
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
                        ₹{Number(d.amount).toFixed(2)}
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
            {/* Pagination */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 36px",
                background: "#f9f9fb",
                borderTop: "1px solid #e0e7ef",
              }}
            >
              <div style={{ color: "#555", fontSize: 16 }}>
                Page{" "}
                <strong>
                  {currentPage} of {totalPages}
                </strong>
              </div>
              <div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 6,
                    background: "#e0e7ef",
                    color: "#333",
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                    marginRight: 8,
                    opacity: currentPage === 1 ? 0.6 : 1,
                  }}
                >
                  ◀ Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 6,
                    background: "#22c55e",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer",
                    opacity: currentPage === totalPages ? 0.6 : 1,
                  }}
                >
                  Next ▶
                </button>
              </div>
            </div>
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