import React, { useState, useEffect } from "react";
import { loginWithGoogle, logout, checkAuthState } from "./auth";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { uploadToIPFS, fetchFromIPFS } from "./storage";

const App = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [tcKimlik, setTcKimlik] = useState("");
  const [notlar, setNotlar] = useState("");
  const [ogrenciNot, setOgrenciNot] = useState("");
  const [hash, setHash] = useState("");

  useEffect(() => {
    checkAuthState(async (loggedUser) => {
      if (loggedUser) {
        setUser(loggedUser);
        await getUserRole(loggedUser.uid);
      } else {
        setUser(null);
        setRole(null);
      }
    });
  }, []);

  // Kullanıcının rolünü ve TC kimlik numarasını Firestore'dan al
  const getUserRole = async (uid) => {
    const userRef = doc(db, "students", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      setRole(userData.role);
      setTcKimlik(userData.tcKimlik || "");
    } else {
      setRole("student"); // Varsayılan olarak öğrenci
      setTcKimlik("");
      await setDoc(userRef, { role: "student", tcKimlik: "" });
    }
  };

  // Öğretmen not eklediğinde veriyi IPFS'e yükleyip Firestore'a hash kaydeder
  const handleAddGrade = async () => {
    if (!user) return alert("Önce giriş yapın!");
    if (role !== "teacher") return alert("Sadece öğretmenler not ekleyebilir!");

    const data = { tcKimlik, notlar: notlar.split(",") };
    const ipfsHash = await uploadToIPFS(data);

    if (ipfsHash) {
      setHash(ipfsHash);
      console.log("IPFS Hash Kaydedildi:", ipfsHash);

      // Firestore'a TC Kimlik ile hash kaydet
      const gradeRef = doc(db, "grades", tcKimlik);
      await setDoc(gradeRef, { ipfsHash });

      alert(`Veriler başarıyla IPFS'e yüklendi! Hash: ${ipfsHash}`);
    } else {
      alert("Yükleme başarısız oldu!");
    }
  };

  // Öğrenci giriş yaptığında kendi TC kimlik numarasıyla notlarını çeker
  const handleCheckGrade = async () => {
    if (!user) {
      alert("Önce giriş yapın!");
      return;
    }

    try {
      // Firestore'dan UID ile TC Kimlik No'yu al
      const studentRef = doc(db, "students", user.uid);
      const studentSnap = await getDoc(studentRef);

      if (!studentSnap.exists()) {
        alert("Öğrenci bilgileri bulunamadı!");
        return;
      }

      const studentData = studentSnap.data();
      const tcKimlik = studentData.tcKimlik;

      // Firestore'dan TC Kimlik ile Hash'i çek
      const gradeRef = doc(db, "grades", tcKimlik);
      const gradeSnap = await getDoc(gradeRef);

      if (!gradeSnap.exists()) {
        alert("Bu TC Kimlik No'ya ait veri bulunamadı!");
        return;
      }

      const hash = gradeSnap.data().ipfsHash;
      setHash(hash);

      // IPFS'ten veriyi çek
      const data = await fetchFromIPFS(hash);
      if (data) {
        setOgrenciNot(data.notlar.join(", "));
      } else {
        alert("Veri alınamadı!");
      }
    } catch (error) {
      console.error("Notları alma hatası:", error);
      alert("Bir hata oluştu, lütfen tekrar deneyin.");
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

          {role === "student" && (
            <div>
              <h3>Notları Gör</h3>
              <button onClick={handleCheckGrade}>Notları Göster</button>
              {ogrenciNot && <p>Notlar: {ogrenciNot}</p>}
            </div>
          )}
        </>
      ) : (
        <button onClick={loginWithGoogle}>Google ile Giriş Yap</button>
      )}
    </div>
  );
};

export default App;
