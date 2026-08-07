const fs = require('fs');
let content = fs.readFileSync('index.js', 'utf8');
if (!content.includes('/api/tickets')) {
    content = content.replace("const authRoutes = require('./routes/auth');", "const authRoutes = require('./routes/auth');\nconst ticketRoutes = require('./routes/tickets');");
    content = content.replace("app.use('/api/auth', authRoutes);", "app.use('/api/auth', authRoutes);\napp.use('/api/tickets', ticketRoutes);");
    fs.writeFileSync('index.js', content, 'utf8');
}
