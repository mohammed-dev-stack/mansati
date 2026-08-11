// backend/middleware/logger.js
// 📝 مسؤول: تسجيل الطلبات والأنشطة - نسخة محسنة وآمنة للإنتاج
// @version 2.0.0
// @lastUpdated 2026

const fs = require("fs");
const path = require("path");

/**
 * التأكد من وجود مجلد السجلات، وإنشائه إذا لم يكن موجوداً
 */
const ensureLogsDirectory = () => {
    const logsDir = path.join(__dirname, "../logs");
    if (!fs.existsSync(logsDir)) {
        try {
            fs.mkdirSync(logsDir, { recursive: true });
            console.log("📁 [Logger] Created logs directory at:", logsDir);
        } catch (err) {
            console.error("❌ [Logger] Failed to create logs directory:", err.message);
        }
    }
    return logsDir;
};

/**
 * دالة مساعدة لكتابة سجل مع تنسيق ثابت
 */
const writeToLogFile = (logItem) => {
    const logsDir = ensureLogsDirectory();
    const logFilePath = path.join(logsDir, "reqLog.txt");

    // إضافة السجل إلى الملف بشكل غير متزامن (لا نريد تعطيل الطلب)
    fs.appendFile(logFilePath, logItem, (err) => {
        if (err) {
            // في حالة خطأ الكتابة، نسجله في console فقط (لا نريد إيقاع خطأ في الطلب)
            console.error("❌ [Logger] Failed to write to log file:", err.message);
        }
    });
};

/**
 * Middleware لتسجيل كل طلب وارد
 * @param {Request} req - كائن الطلب
 * @param {Response} res - كائن الاستجابة
 * @param {Function} next - دالة التالي
 */
const logger = (req, res, next) => {
    try {
        // تجهيز نص السجل بمعلومات مفيدة
        const timestamp = new Date().toISOString();
        const method = req.method;
        const url = req.url;
        // باستخدام && للتأكد أن req.connection موجود قبل الوصول لـ remoteAddress
        const ip = req.ip || (req.connection && req.connection.remoteAddress) || "unknown";

        const userAgent = req.get("User-Agent") || "unknown";

        // نستخدم رأس X-Forwarded-For إذا كان موجوداً (عند وجود proxy)
        const realIp = req.headers["x-forwarded-for"] || ip;

        const logItem = `[${timestamp}] ${method} ${url} | IP: ${realIp} | UA: ${userAgent}\n`;

        // كتابة السجل في الملف (مع معالجة الأخطاء داخلياً)
        writeToLogFile(logItem);

        // طباعة في وحدة التحكم للتشخيص السريع
        console.log(`📌 Request: ${method} ${url} - ${realIp}`);

        // الاستماع لحدث انتهاء الطلب لتسجيل رمز الحالة
        res.on("finish", () => {
            const statusLog = `[${new Date().toISOString()}] ${method} ${url} - Status: ${res.statusCode}\n`;
            writeToLogFile(statusLog);
            console.log(`   ↳ Status: ${res.statusCode}`);
        });

        next();
    } catch (error) {
        // في حالة حدوث أي خطأ غير متوقع في الـ middleware نفسه، نسجله ونستمر
        console.error("❌ [Logger] Unexpected error in logger middleware:", error);
        next(); // لا نريد إيقاف الطلب بسبب خطأ في التسجيل
    }
};

module.exports = logger;