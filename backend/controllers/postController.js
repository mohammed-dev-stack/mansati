// backend/controllers/postController.js
// 🚀 مسؤول: إدارة المنشورات – الإصدار 5.4.0 (مع التحقق الذري من الملفات)
// @version 5.4.0
// @lastUpdated 2026

const Post = require("../models/Post");
const User = require("../models/User");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// ============================================================
// 📋 الثوابت
// ============================================================

const CONSTANTS = {
    MAX_POST_LENGTH: 5000,
    MAX_COMMENT_LENGTH: 1000,
    MAX_LIMIT: 50,
    UPLOAD_DIR: path.join(__dirname, "../uploads"),
};

// ============================================================
// 🧰 دوال مساعدة (Helper Functions)
// ============================================================

/**
 * التحقق من صحة معرف MongoDB
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * تنظيف النصوص من المسافات الزائدة
 */
const sanitizeText = (text) => {
    if (!text) return "";
    return text.trim().replace(/\s+/g, " ");
};

/**
 * تنسيق المنشور قبل الإرسال للعميل
 */
const formatPost = (postDoc, currentUserId) => {
    if (!postDoc) return null;
    const postObj = postDoc.toObject ? postDoc.toObject() : postDoc;
    postObj._id = postObj._id.toString();

    if (currentUserId && postObj.reactions) {
        const myReaction = postObj.reactions.find(
            (r) =>
            r.user &&
            r.user._id &&
            r.user._id.toString() === currentUserId.toString()
        );
        postObj.userReaction = myReaction ? myReaction.type : null;
    }

    if (!postObj.author) {
        postObj.author = { name: "مستخدم", avatar: null };
    }
    return postObj;
};

// ============================================================
// 📝 إنشاء منشور جديد (Create Post) – مع التحقق الذري من وجود الملفات
// ============================================================

const createPost = async(req, res) => {
    try {
        const { title, content } = req.body;

        // التحقق من وجود البيانات الأساسية
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required",
            });
        }

        const cleanTitle = sanitizeText(title);
        const cleanContent = sanitizeText(content);

        if (cleanContent.length > CONSTANTS.MAX_POST_LENGTH) {
            return res.status(400).json({
                success: false,
                message: "Post content too long",
            });
        }

        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        // ✅ معالجة الملفات المرفوعة – مع التحقق الذري من وجودها على القرص
        const mediaFiles = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                // المسار النسبي للتخزين في قاعدة البيانات
                const dbPath = `/uploads/${file.filename}`;
                // المسار المطلق للتحقق من الوجود الفعلي
                const absolutePath = path.join(CONSTANTS.UPLOAD_DIR, file.filename);

                console.log(`🔍 [createPost] التحقق من الملف: ${absolutePath}`);

                // ✅ التأكد من أن الملف موجود فعلياً على القرص (حماية ذرية)
                if (fs.existsSync(absolutePath)) {
                    console.log(`✅ [createPost] الملف موجود: ${absolutePath}`);
                    mediaFiles.push(dbPath);
                } else {
                    // ❌ حدث خطأ كارثي: الملف غير موجود رغم محاولة الحفظ!
                    console.error(`❌ [createPost] الملف غير موجود بعد الحفظ: ${absolutePath}`);

                    // تنظيف أي ملفات سابقة تم حفظها في هذه الجلسة
                    for (const prevFile of req.files) {
                        const prevPath = path.join(CONSTANTS.UPLOAD_DIR, prevFile.filename);
                        if (fs.existsSync(prevPath)) {
                            fs.unlinkSync(prevPath);
                            console.log(`🗑️ [createPost] تم حذف الملف: ${prevPath}`);
                        }
                    }

                    return res.status(500).json({
                        success: false,
                        message: "فشل حفظ الملف على الخادم، يرجى المحاولة مرة أخرى",
                    });
                }
            }
        }

        console.log(`📸 [createPost] الملفات المخزنة في DB: ${mediaFiles.join(", ")}`);

        // إنشاء المنشور في قاعدة البيانات (بعد التأكد من وجود الملفات)
        const post = await Post.create({
            title: cleanTitle,
            content: cleanContent,
            media: mediaFiles,
            author: req.user._id,
        });

        const populatedPost = await Post.findById(post._id)
            .populate("author", "name avatar email")
            .lean();

        res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: formatPost(populatedPost, req.user._id),
        });
    } catch (err) {
        console.error("❌ [createPost] Error:", err.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// ============================================================
// 📋 جلب جميع المنشورات (Get Posts)
// ============================================================

const getPosts = async(req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        if (page < 1) page = 1;
        if (limit > CONSTANTS.MAX_LIMIT) limit = CONSTANTS.MAX_LIMIT;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .populate("author", "name avatar email")
            .populate("comments.user", "name avatar")
            .populate("reactions.user", "name avatar")
            .populate("shares.user", "name avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const postsWithStats = posts.map((post) => ({
            ...post,
            commentsCount: post.comments ? post.comments.length : 0,
            sharesCount: post.shares ? post.shares.length : 0,
            reactionsCount: post.reactions ? post.reactions.length : 0,
        }));

        const total = await Post.countDocuments();

        res.json({
            success: true,
            data: postsWithStats.map((p) =>
                formatPost(p, req.user ? req.user._id : null)
            ),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error("❌ [getPosts] Error:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ============================================================
// 👤 جلب منشورات مستخدم معين (Get Posts by User)
// ============================================================

const getPostsByUser = async(req, res) => {
    try {
        const { userId } = req.params;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id",
            });
        }

        const posts = await Post.find({ author: userId })
            .populate("author", "name avatar email")
            .populate("comments.user", "name avatar")
            .populate("reactions.user", "name avatar")
            .populate("shares.user", "name avatar")
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            data: posts.map((p) => formatPost(p, req.user ? req.user._id : null)),
        });
    } catch (err) {
        console.error("❌ [getPostsByUser] Error:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ============================================================
// ✏️ تحديث منشور (Update Post)
// ============================================================

const updatePost = async(req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post id",
            });
        }

        const post = await Post.findOne({
            _id: id,
            author: req.user._id,
        });

        if (!post) {
            return res.status(403).json({
                success: false,
                message: "Not allowed",
            });
        }

        const updates = {
            title: sanitizeText(req.body.title),
            content: sanitizeText(req.body.content),
        };

        const updatedPost = await Post.findByIdAndUpdate(id, updates, { new: true })
            .populate("author", "name avatar email")
            .lean();

        res.json({
            success: true,
            message: "Post updated",
            data: formatPost(updatedPost, req.user._id),
        });
    } catch (err) {
        console.error("❌ [updatePost] Error:", err.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// ============================================================
// 🗑️ حذف منشور (Delete Post)
// ============================================================

const deletePost = async(req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post id",
            });
        }

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        // التحقق من صلاحية الحذف (المالك أو الأدمن)
        if (post.author.toString() !== req.user._id) {
            const user = await User.findById(req.user._id);
            if (!user || user.role !== "admin") {
                return res.status(403).json({
                    success: false,
                    message: "Not allowed",
                });
            }
        }

        // حذف الملفات المرتبطة من مجلد uploads
        if (post.media && post.media.length > 0) {
            for (const mediaPath of post.media) {
                const fileName = mediaPath.replace("/uploads/", "");
                const filePath = path.join(CONSTANTS.UPLOAD_DIR, fileName);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`🗑️ [deletePost] تم حذف الملف: ${filePath}`);
                }
            }
        }

        await post.deleteOne();

        res.json({
            success: true,
            message: "Post deleted",
        });
    } catch (err) {
        console.error("❌ [deletePost] Error:", err.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// ============================================================
// 💬 إضافة تعليق (Add Comment)
// ============================================================

const addComment = async(req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post id",
            });
        }

        const cleanText = sanitizeText(text);

        if (!cleanText || cleanText.length > CONSTANTS.MAX_COMMENT_LENGTH) {
            return res.status(400).json({
                success: false,
                message: "Invalid comment",
            });
        }

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        post.comments.push({
            user: req.user._id,
            text: cleanText,
            createdAt: new Date(),
        });

        await post.save();

        const updatedPost = await Post.findById(id)
            .populate("author", "name avatar")
            .populate("comments.user", "name avatar")
            .lean();

        res.json({
            success: true,
            message: "Comment added",
            data: formatPost(updatedPost, req.user._id),
        });
    } catch (err) {
        console.error("❌ [addComment] Error:", err.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// ============================================================
// 🔄 مشاركة منشور (Add Share)
// ============================================================

const addShare = async(req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post id",
            });
        }

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        post.shares.push({ user: userId, createdAt: new Date() });

        await post.save();

        const updatedPost = await Post.findById(id)
            .populate("author", "name avatar email")
            .populate("shares.user", "name avatar")
            .lean();

        res.json({
            success: true,
            message: "Post shared",
            data: formatPost(updatedPost, req.user._id),
        });
    } catch (err) {
        console.error("❌ [addShare] Error:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ============================================================
// ❤️ إضافة تفاعل (Add Reaction)
// ============================================================

const addReaction = async(req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body;

        const validTypes = [
            "like",
            "love",
            "care",
            "haha",
            "wow",
            "sad",
            "angry",
        ];

        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid reaction type",
            });
        }

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        const index = post.reactions.findIndex(
            (r) => r.user && r.user.toString() === req.user._id.toString()
        );

        if (index !== -1) {
            post.reactions[index].type = type;
        } else {
            post.reactions.push({
                user: req.user._id,
                type,
                createdAt: new Date(),
            });
        }

        await post.save();

        const updatedPost = await Post.findById(id)
            .populate("author", "name avatar email")
            .populate("reactions.user", "name avatar")
            .lean();

        res.json({
            success: true,
            message: "Reaction added",
            data: formatPost(updatedPost, req.user._id),
        });
    } catch (err) {
        console.error("❌ [addReaction] Error:", err.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// ============================================================
// 📤 تصدير الدوال
// ============================================================

module.exports = {
    createPost,
    getPosts,
    getPostsByUser,
    updatePost,
    deletePost,
    addComment,
    addShare,
    addReaction,
};