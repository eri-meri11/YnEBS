import axios from "axios";

// 📌 Pinata API Key ve Secret
const PINATA_API_KEY = "ecca4e9759e36acd662b";
const PINATA_SECRET_API_KEY = "f54cdd7379bd5ecd1a8a54b2b3f5e8ba25f2574be7fc4f9bc502771843d974ec";

// 📌 IPFS'e JSON yükleme
export const uploadToIPFS = async (data) => {
  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      { pinataContent: data },
      {
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      }
    );
    return res.data.IpfsHash; // IPFS Hash'i döndür
  } catch (error) {
    console.error("Pinata yükleme hatası:", error.response?.data || error.message);
    return null;
  }
};

// 📌 IPFS'ten JSON çekme
export const fetchFromIPFS = async (hash) => {
  try {
    const res = await axios.get(`https://gateway.pinata.cloud/ipfs/${hash}`);
    return res.data;
  } catch (error) {
    console.error("IPFS veri çekme hatası:", error);
    return null;
  }
};
