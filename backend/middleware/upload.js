// backend/middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ المسار المطلق لمجلد uploads (يُستخدم في كل مكان)
const uploadDir = path.join(__dirname, "../uploads");

// إنشاء مجلد uploads إذا لم يكن موجوداً
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`📁 [upload] تم إنشاء مجلد uploads في: ${uploadDir}`);
} else {
    console.log(`📁 [upload] مجلد uploads موجود في: ${uploadDir}`);
}

// قائمة الامتدادات المسموحة
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.avi', '.mkv'];

// فلترة الملفات حسب النوع
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Unsupported file type: ${ext}`), false);
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // ✅ استخدام المسار المطلق بدلاً من النسبي (هذا هو الحل الجذري)
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const cleanExt = ALLOWED_EXTENSIONS.includes(ext) ? ext : '.jpg';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = `${uniqueSuffix}${cleanExt}`;
        console.log(`📸 [upload] حفظ الملف باسم: ${filename} في المسار: ${uploadDir}`);
        cb(null, filename);
    }
});

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    }
});

module.exports = upload;