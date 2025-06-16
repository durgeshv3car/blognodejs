const db = require('../models');
const { upload, processImage } = require("../config/multerConfig");
const fs = require("fs");
const path = require("path");


// Get all blogs with their associated category
exports.getAllBlogs = async (req, res) => {
  try {
    const { domain } = req.query; 
    const blogs = await db.Blog.findAll({
      include: {
        model: db.Category,
        as: 'category',
      },
    });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllBlogsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const blogs = await db.Blog.findAll({
      where: { userId }, 
      include: {
        model: db.Category,
        as: 'category',
      },
    });

    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Get a single blog by ID with its associated category
exports.getBlogById = async (req, res) => {
  try {
    const blog = await db.Blog.findByPk(req.params.id, {
      include: {
        model: db.Category,
        as: 'category',
      },
    });
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.createBlog = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    processImage(req, res, async (processErr) => {
      if (processErr) {
        return res.status(500).json({
          success: false,
          message: "Image processing failed",
        });
      }

      try {
        let {
          title,
          description,
          redirectUrl,
          isActive,
          categoryId,
          domain,
          detailDescription,
          userId,
        } = req.body;
     

        // Handle comma-separated string of UUIDs
        if (typeof categoryId === 'string') {
          // Check if it's a JSON string
          if (categoryId.startsWith('[') || categoryId.startsWith('{')) {
            try {
              categoryId = JSON.parse(categoryId);
            } catch (e) {
              console.error("Error parsing categoryId JSON:", e);
            }
          } 
          // Check if it's a comma-separated string
          else if (categoryId.includes(',')) {
            categoryId = categoryId.split(',').map(id => id.trim());
          }
        }
        
        // Convert categoryId to array if it's not already
        if (!Array.isArray(categoryId)) {
          categoryId = [categoryId];
        }

        // Validate that all category IDs exist in the database
        const validCategories = await db.Category.findAll({
          where: {
            id: categoryId
          }
        });
        
        const validCategoryIds = validCategories.map(category => category.id);
        const invalidCategoryIds = categoryId.filter(id => !validCategoryIds.includes(id));
        
        if (invalidCategoryIds.length > 0) {
          return res.status(400).json({
            success: false,
            message: `The following category IDs do not exist: ${invalidCategoryIds.join(', ')}`
          });
        }

        const webFile = req.processedFiles?.web;
        const mobileFile = req.processedFiles?.mobile;
        const webThumb = req.processedFiles?.webThumb;
        const mobileThumb = req.processedFiles?.mobileThumb;

        if (!webFile && !mobileFile) {
          return res.status(400).json({
            success: false,
            message: "At least one image (web, mobile, or brand logo) is required",
          });
        }

        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const createdBlogs = [];
        await Promise.all(
          categoryId.map(async (id) => {
            const blog = await db.Blog.create({
              title,
              description,
              redirectUrl,
              categoryId: id,
              domain,
              isActive: isActive !== undefined ? isActive : true,
              blogImage: {
                web: webFile ? baseUrl + webFile : null,
                mobile: mobileFile ? baseUrl + mobileFile : null,
              },
              detailDescription,
              thumbnail: {
                web: webThumb ? baseUrl + webThumb : null,
                mobile: mobileThumb ? baseUrl + mobileThumb : null,
              },
              userId
            });
            createdBlogs.push(blog);
          })
        );

        return res.status(200).json({ success: true, blogs: createdBlogs });
      } catch (error) {
        console.error("Error creating blogs:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to create blogs",
          error: error.message,
        });
      }
    });
  });
};

// Update an existing blog
exports.updateBlog = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    processImage(req, res, async (processErr) => {
      if (processErr) {
        return res
          .status(500)
          .json({ success: false, message: "Image processing failed" });
      }

      const { title, redirectUrl, description, detailDescription,webUrl,mobileUrl,domain, isActive } = req.body;

      const blog = await db.Blog.findByPk(req.params.id);
      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
      }

      const basePath = path.join(__dirname, "../uploads/");
      const webFile = req.processedFiles?.web;
      const mobileFile = req.processedFiles?.mobile;
      const webThumb = req.processedFiles?.webThumb;
      const mobileThumb = req.processedFiles?.mobileThumb;

      // Unlink old images if new ones are uploaded
      if (webFile && blog.blogImage?.web) {
        fs.unlinkSync(basePath + blog.blogImage.web.split("/uploads/")[1]);
      }
      if (mobileFile && blog.blogImage?.mobile) {
        fs.unlinkSync(basePath + blog.blogImage.mobile.split("/uploads/")[1]);
      }
      if (webThumb && blog.thumbnail?.web) {
        fs.unlinkSync(basePath + blog.thumbnail.web.split("/uploads/")[1]);
      }
      if (mobileThumb && blog.thumbnail?.mobile) {
        fs.unlinkSync(basePath + blog.thumbnail.mobile.split("/uploads/")[1]);
      }
      if (webUrl === "empty" && blog.blogImage?.web) {
        if (!webFile) {
          fs.unlinkSync(basePath + blog.blogImage.web.split("/uploads/")[1]);
          blog.blogImage={
            web:null,
            mobile:blog.blogImage?.mobile
          };
        }
      }

      if (mobileUrl === "empty" && blog.blogImage?.mobile) {
        if (!mobileFile) {
          fs.unlinkSync(basePath + blog.blogImage.mobile.split("/uploads/")[1]);
          blog.blogImage={
            web:blog.blogImage?.web,
            mobile:null
          };
        }
      }

      if (webUrl === "empty" && blog.thumbnail?.web) {
        if (!webThumb) {
          fs.unlinkSync(basePath + blog.thumbnail.web.split("/uploads/")[1]);
          blog.thumbnail={
            web:null,
            mobile:blog.thumbnail?.mobile
          }
        }
      }

      if (mobileUrl === "empty" && blog.thumbnail?.mobile) {
        if (!mobileThumb) {
          fs.unlinkSync(basePath + blog.thumbnail.mobile.split("/uploads/")[1]);
          blog.thumbnail={
            web:blog.thumbnail?.web,
            mobile:null
          }
        }
      }

      const baseUrl = `${req.protocol}://${req.get("host")}`;
  
      blog.title = title || blog.title;
      blog.redirectUrl = redirectUrl || blog.redirectUrl;
      blog.description = description || blog.description;
      blog.detailDescription = detailDescription || blog.detailDescription;
      blog.isActive = isActive !== undefined ? isActive : blog.isActive;
      blog.domain = domain || blog.domain;
      blog.blogImage = {
        web: webFile ? baseUrl + webFile : blog.blogImage?.web,
        mobile: mobileFile ? baseUrl + mobileFile : blog.blogImage?.mobile,
      };
      blog.thumbnail = {
        web: webThumb ? baseUrl + webThumb : blog.thumbnail?.web,
        mobile: mobileThumb ? baseUrl + mobileThumb : blog.thumbnail?.mobile,
      }
      await blog.save();
      res.json(blog);
    });
  });
};

// Delete a blog
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await db.Blog.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    const basePath = path.join(__dirname, "../uploads/");
    if (blog.blogImage?.web)
      fs.unlinkSync(basePath + blog.blogImage?.web.split("/uploads/")[1]);
    if (blog.blogImage?.mobile)
      fs.unlinkSync(basePath + blog.blogImage?.mobile.split("/uploads/")[1]);
    if (blog.thumbnail?.web)
      fs.unlinkSync(basePath + blog.thumbnail.web.split("/uploads/")[1]);
    if (blog.thumbnail?.mobile)
      fs.unlinkSync(basePath + blog.thumbnail.mobile.split("/uploads/")[1]);

    await blog.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};