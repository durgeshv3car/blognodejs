const express = require('express');
const app = express();
const dotenv = require('dotenv');
const blogRoutes = require('./routes/blogRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');
const domainRoutes = require('./routes/domainRoutes');
const s3Routes = require("./routes/s3Routes");


const db = require('./models');
const path = require('path');

dotenv.config();

const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Routes
app.use('/api/blogs', blogRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/domains', domainRoutes);
app.use("/s3", s3Routes);



const PORT = process.env.PORT || 5000;
db.sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
