require('dotenv').config();
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/analyze', upload.single('image'), async (req, res) => {
  const imagePath = req.file.path;

  try {
    const response = await axios.post(
      'https://api.imagga.com/v2/tags',
      fs.createReadStream(imagePath),
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.API_KEY}:${process.env.API_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/octet-stream'
        }
      }
    );

    const tags = response.data.result.tags.slice(0, 5).map(tag => ({
      tag: tag.tag.en,
      confidence: tag.confidence.toFixed(2)
    }));

    res.json({ tags });
  } catch (error) {
    res.status(500).json({ error: "Error al analizar la imagen" });
  } finally {
    fs.unlinkSync(imagePath); // eliminar el archivo temporal
  }
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
