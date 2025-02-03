import React, { useState, useEffect } from "react";
import { loginWithGoogle, logout, checkAuthState } from "./auth";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { uploadToIPFS, fetchFromIPFS } from "./storage"; // Pinata ile IPFS yükleme ve okuma

const App = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [tcKimlik, setTcKimlik] = useState("");
  const [notlar, setNotlar] = useState("");
  const [ogrenciNot, setOgrenciNot] = useState("");
  const [hash, setHash] = useState("");

  useEffect(() => {
    checkAuthState(async (loggedUser) => {
      setUser(loggedUser);
      if (loggedUser) {
        await getUserRole(loggedUser.uid);
      }
    });
  }, []);

  const getUserRole = async (uid) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      setRole(userSnap.data().role);
    } else {
      setRole("student");
    }
  };

  const handleAddGrade = async () => {
    if (!user) return alert("Önce giriş yapın!");

    const data = { tcKimlik, notlar: notlar.split(",") }; // Notları listeye çevir
    const ipfsHash = await uploadToIPFS(data);

    if (ipfsHash) {
      setHash(ipfsHash);
      alert(`Veriler başarıyla IPFS'e yüklendi! Hash: ${ipfsHash}`);
    } else {
      alert("Yükleme başarısız oldu!");
    }
  };

  const handleCheckGrade = async () => {
    if (!hash) return alert("Önce bir hash girin!");
    
    const data = await fetchFromIPFS(hash);
    if (data && data.tcKimlik === tcKimlik) {
      setOgrenciNot(data.notlar.join(", "));
    } else {
      alert("Veri bulunamadı veya hatalı TC Kimlik No!");
    }
  };

  return (
    <div>
      {user ? (
        <>
          <h2>Hoş geldin, {user.displayName}</h2>
          <button onClick={logout}>Çıkış Yap</button>

          {role === "teacher" && (
            <div>
              <h3>Not Ekle</h3>
              <input
                type="text"
                placeholder="Öğrenci TC Kimlik No"
                value={tcKimlik}
                onChange={(e) => setTcKimlik(e.target.value)}
              />
              <input
                type="text"
                placeholder="Notları virgülle ayırarak gir (örn: 90,85,78)"
                value={notlar}
                onChange={(e) => setNotlar(e.target.value)}
              />
              <button onClick={handleAddGrade}>Notu Kaydet</button>
            </div>
          )}

          <div>
            <h3>Notları Gör</h3>
            <input
              type="text"
              placeholder="TC Kimlik No"
              value={tcKimlik}
              onChange={(e) => setTcKimlik(e.target.value)}
            />
            <button onClick={handleCheckGrade}>Notları Göster</button>
            {ogrenciNot && <p>Notlar: {ogrenciNot}</p>}
          </div>
        </>
      ) : (
        <button onClick={loginWithGoogle}>Google ile Giriş Yap</button>
      )}
    </div>
  );
};

export default App;
