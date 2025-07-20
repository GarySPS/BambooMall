require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ===== AUTO CREATE ADMIN ACCOUNT ON STARTUP =====
(async () => {
  try {
    console.log("ADMIN EMAIL:", process.env.ADMIN_EMAIL, "SUPABASE_URL:", process.env.SUPABASE_URL);
    const { data: admin, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', process.env.ADMIN_EMAIL)
      .single();

    if (!admin) {
  const { data: inserted, error: insertError } = await supabase.from('users').insert([
    {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      username: 'admin',
      verified: true,
      kyc_status: 'approved',
      is_admin: true
    }
  ]);
  console.log("ADMIN INSERT RESULT:", { inserted, insertError });

  console.log('Default admin user created:', process.env.ADMIN_EMAIL);
}
  } catch (err) {
    console.error('Admin creation error:', err.message || err);
  }
})();

// Attach supabase to req for all routes
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

app.get('/', (req, res) => res.send('BambooMall backend running!'));

// Route imports
app.use('/api/products', require('./routes/products'));
app.use('/api/users', require('./routes/users'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/kyc', require('./routes/kyc'));
app.use('/api/news', require('./routes/news'));


const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend API listening on port ${PORT}`);
});
