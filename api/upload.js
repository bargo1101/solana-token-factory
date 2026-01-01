import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();
const upload = multer();

export const config = { api: { bodyParser: false } };

export default upload.single("file")(async (req, res) => {
  try {
    const img = new FormData();
    img.append("file", req.file.buffer, req.file.originalname);

    const imgRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.PINATA_JWT}` },
      body: img,
    });
    const imgData = await imgRes.json();
    const imageUrl = `https://gateway.pinata.cloud/ipfs/${imgData.IpfsHash}`;

    const meta = { name: req.body.name, symbol: req.body.symbol, image: imageUrl };

    const metaRes = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(meta),
    });
    const metaData = await metaRes.json();

    res.status(200).json({ uri: `https://gateway.pinata.cloud/ipfs/${metaData.IpfsHash}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});
