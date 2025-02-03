import { create } from "ipfs-http-client";

const ipfs = create({ host: "ipfs.infura.io", port: 5001, protocol: "https" });

export const uploadToIPFS = async (data) => {
  try {
    const { path } = await ipfs.add(data);
    return path;
  } catch (error) {
    console.error("IPFS yükleme hatası:", error);
  }
};

export const fetchFromIPFS = async (hash) => {
  try {
    const response = await fetch(`https://ipfs.infura.io/ipfs/${hash}`);
    return await response.json();
  } catch (error) {
    console.error("IPFS'ten veri çekme hatası:", error);
  }
};
