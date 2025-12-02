const fs = require('fs');
const path = require('path');

// Crear directorio de uploads si no existe
const ensureUploadsDir = () => {
  const uploadsDir = path.join(__dirname, '../uploads');
  const imagesDir = path.join(uploadsDir, 'images');
  const patternsDir = path.join(uploadsDir, 'patterns');

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  if (!fs.existsSync(patternsDir)) {
    fs.mkdirSync(patternsDir, { recursive: true });
  }

  return { uploadsDir, imagesDir, patternsDir };
};

// Guardar archivo en el disco
const saveFile = (fileBuffer, fileName, folderPath) => {
  const filePath = path.join(folderPath, fileName);
  fs.writeFileSync(filePath, fileBuffer);
  return filePath;
};

// Procesar archivos de producto
const processProductFiles = (productId, filesFromMulter) => {
  const { uploadsDir, imagesDir, patternsDir } = ensureUploadsDir();
  const processedFiles = [];

  // Procesar imágenes
  if (filesFromMulter.images && Array.isArray(filesFromMulter.images)) {
    filesFromMulter.images.forEach((file) => {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileName = `${timestamp}-${randomStr}-${file.originalname}`;
      const productImagesDir = path.join(imagesDir, String(productId));

      if (!fs.existsSync(productImagesDir)) {
        fs.mkdirSync(productImagesDir, { recursive: true });
      }

      const filePath = saveFile(file.buffer, fileName, productImagesDir);
      const relativePath = path.relative(uploadsDir, filePath).replace(/\\/g, '/');

      processedFiles.push({
        fileName: fileName,
        originalName: file.originalname,
        filePath: relativePath,
        fileType: 'image',
        fileSize: file.size
      });
    });
  }

  // Procesar archivos de patrones
  if (filesFromMulter.files && Array.isArray(filesFromMulter.files)) {
    filesFromMulter.files.forEach((file) => {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileName = `${timestamp}-${randomStr}-${file.originalname}`;
      const productPatternsDir = path.join(patternsDir, String(productId));

      if (!fs.existsSync(productPatternsDir)) {
        fs.mkdirSync(productPatternsDir, { recursive: true });
      }

      const filePath = saveFile(file.buffer, fileName, productPatternsDir);
      const relativePath = path.relative(uploadsDir, filePath).replace(/\\/g, '/');

      processedFiles.push({
        fileName: fileName,
        originalName: file.originalname,
        filePath: relativePath,
        fileType: 'pattern',
        fileSize: file.size
      });
    });
  }

  return processedFiles;
};

// Obtener URL pública del archivo
const getPublicFileUrl = (filePath, baseUrl = 'http://localhost:10000/api') => {
  return `${baseUrl}/files/download/${filePath}`;
};

module.exports = {
  ensureUploadsDir,
  saveFile,
  processProductFiles,
  getPublicFileUrl
};
