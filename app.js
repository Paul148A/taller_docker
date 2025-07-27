require("dotenv").config();
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const FormData = require("form-data");

const app = express();
app.use(cors());
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));


app.post("/analyze", upload.single("image"), async (req, res) => {
  const imagePath = req.file.path;

  const apiKey = "acc_0fea4690497a1c5";
  const apiSecret = "d196e3d8449271a3307eb68a4804bd5a";

  try {
    // Paso 1: Crear el form-data con el archivo bajo el campo 'image'
    const form = new FormData();
    form.append("image", fs.createReadStream(imagePath));

    // Paso 2: Subir la imagen a Imagga
    const uploadResponse = await axios.post(
      "https://api.imagga.com/v2/uploads",
      form,
      {
        auth: {
          username: apiKey,
          password: apiSecret,
        },
        headers: form.getHeaders(),
      }
    );

    const uploadId = uploadResponse.data.result.upload_id;

    // Paso 3: Obtener etiquetas
    const tagResponse = await axios.get(
      `https://api.imagga.com/v2/tags?image_upload_id=${uploadId}`,
      {
        auth: {
          username: apiKey,
          password: apiSecret,
        },
      }
    );

    const tags = tagResponse.data.result.tags.map(tag => ({
      tag: tag.tag.en,
      confidence: tag.confidence.toFixed(2),
    }));

    res.json({ tags });

    // Limpieza del archivo temporal
    fs.unlinkSync(imagePath);
  } catch (error) {
    console.error("Error en análisis:", error.response?.data || error.message);
    res.status(500).json({ error: "Error al analizar la imagen." });
  }
});



app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
