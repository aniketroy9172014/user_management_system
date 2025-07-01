const express = require('express');
const mongoose = require('mongoose');
const port = 5000;
const app = express();
const Admin = require('./models/Admin');
const User = require('./models/Users');

// Middleware to parse JSON bodies
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/systemDB')
.then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Routes
app.get('/', (req, res) => {
    res.render('login', { error: null, message: null });
});

app.get('/SignUpPage', (req, res) => {
    res.render('signup', { error: null, message: null });
});

app.get('/admin-panel', async (req, res) => {
    try{
        const allusers= await User.find({});
        res.render('AdminPanel', { users: allusers, error: null, message: null });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.render('AdminPanel', { users: [], error: 'Failed to fetch users.', message: null });
    }
});

app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Check if the username or email already exists
        const existingAdmin = await Admin.findOne({ $or: [{ username }, { email }] });
        if (existingAdmin) {
            res.render('signup', { error: 'Username or email already exists.', message: null, redirect: false });
        } else {
            const newAdmin = new Admin({ username, email, password });
            await newAdmin.save();
            res.render('signup', { message: 'Sign up successful. You can now log in.', error: null, redirect: true });
        }
    } catch (error) {
        console.error('Error in Sign up:', error);
        res.render('signup', { error: 'Sign up faild.', message: null, redirect: false });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admins = await Admin.findOne({ username, password });
        if (admins.username === username) {
            if (admins.password === password) {
                res.render('login', { message: 'Login successful!', error: null, redirect: true });
            } else {
                res.render('login', { error: 'Invalid password.', message: null, redirect: false });
            } 
        } else {
            res.render('login', { error: 'Invalid username.', message: null, redirect: false });
        }
    } catch (error) {
        console.error('Error in Log in:', error);
        res.render('login', { error: 'Log in failed.', message: null, redirect: false });
    }
});

app.post('/add-user', async (req, res) => {
    const { name, age, role, email } = req.body;
    try {
        const newUser = new User({ name, age, role, email });
        await newUser.save();
        const allusers = await User.find({});
        res.render('AdminPanel', { users: allusers, message: 'User added successfully!', error: null });
    } catch (error) {
        console.error('Error adding user:', error);
        const allusers = await User.find({});
        res.render('AdminPanel', { users: allusers, error: 'Failed to add user.', message: null });
    }
}
);

app.post('/modify-user', async(req, res) => {
    const { id, name, age, role, email } = req.body;
    try {
        await User.findByIdAndUpdate(id, { name, age, role, email }, { new: true, runValidators: true }); // this will ensure the user is updated with new values and validators are run
        const allusers = await User.find({});
        res.render('AdminPanel', { users: allusers, message: 'User modified successfully!', error: null });
    }catch(error){
        console.error('Error modifying user:', error);
        const allusers = await User.find({});
        res.render('AdminPanel', { users: allusers, error: 'Failed to modify user.', message: null });
    }
});

app.post('/remove-user', async (req, res) => {
    const { id } = req.body;
    try {
        await User.findByIdAndDelete(id);
        const allusers = await User.find({});
        res.render('AdminPanel', { users: allusers, message: 'User deleted successfully!', error: null });
    } catch (error) {
        console.error('Error deleting user:', error);
        const allusers = await User.find({});
        res.render('AdminPanel', { users: allusers, error: 'Failed to delete user.', message: null });
    }
})

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})