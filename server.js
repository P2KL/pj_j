const express = require('express');
const mysql = require('mysql2/promise');  
const session = require('express-session');
const bcrypt = require('bcrypt');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const path = require('path');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'secret', 
    resave: false,
    saveUninitialized: true
}));

async function getConnection() {
    return await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456', 
        database: 'db_Pj_j' 
    });
}

app.set('view engine', 'ejs');


app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { username, password, f_name, s_name } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        const connection = await getConnection();
        await connection.execute('INSERT INTO users (username, password, f_name, s_name) VALUES (?, ?, ?, ?)', [username, hash, f_name, s_name]);
        await connection.end();
        res.redirect('/');
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.send('Username already exists');
        }
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const connection = await getConnection();
        const [results] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
        await connection.end();

        if (results.length > 0) {
            const user = results[0];
            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (isPasswordCorrect) {
                req.session.user = results[0];
                res.redirect('/places');
            } else {
                res.render('login', { error: 'Incorrect password' });
            }
        } else {
            res.render('login', { error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Error logging out');
        }
        res.redirect('/');
    });
});

app.get('/places', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    try {
        const connection = await getConnection();
        const [rows] = await connection.execute('SELECT * FROM places');
        await connection.end();

        const placesWithImages = rows.map(place => ({
            ...place,
            image1: place.image1 ? `data:image/jpeg;base64,${place.image1.toString('base64')}` : null,
            image2: place.image2 ? `data:image/jpeg;base64,${place.image2.toString('base64')}` : null,
            image3: place.image3 ? `data:image/jpeg;base64,${place.image3.toString('base64')}` : null,
            image4: place.image4 ? `data:image/jpeg;base64,${place.image4.toString('base64')}` : null
        }));

        res.render('places', { places: placesWithImages });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/place/:id', async (req, res) => {
    const placeId = req.params.id;
    try {
        const connection = await getConnection();
        const [placeResults] = await connection.execute('SELECT * FROM places WHERE id = ?', [placeId]);
        const [reviewResults] = await connection.execute(`
            SELECT reviews.*, users.username 
            FROM reviews 
            LEFT JOIN users ON reviews.user_id = users.id 
            WHERE reviews.place_id = ?
        `, [placeId]);
        await connection.end();

        if (placeResults.length === 0) {
            return res.status(404).send('Place not found');
        }

        const place = {
            ...placeResults[0],
            image1: placeResults[0].image1 ? `data:image/jpeg;base64,${placeResults[0].image1.toString('base64')}` : null,
            image2: placeResults[0].image2 ? `data:image/jpeg;base64,${placeResults[0].image2.toString('base64')}` : null,
            image3: placeResults[0].image3 ? `data:image/jpeg;base64,${placeResults[0].image3.toString('base64')}` : null,
            image4: placeResults[0].image4 ? `data:image/jpeg;base64,${placeResults[0].image4.toString('base64')}` : null
        };

        const reviewsWithImages = reviewResults.map(review => ({
            ...review,
            image: review.image ? `data:image/jpeg;base64,${review.image.toString('base64')}` : null
        }));

        res.render('placeDetail', { 
            place, 
            reviews: reviewsWithImages,
            currentUser: req.session.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/place/:id/delete', async (req, res) => {
    const placeId = req.params.id;

    try {
        const connection = await getConnection();
        await connection.execute('DELETE FROM places WHERE id = ?', [placeId]);
        await connection.end();

        res.redirect('/places');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/place/:id/review', upload.single('reviewImage'), async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    const placeId = req.params.id;
    const reviewText = req.body.reviewText;
    const userId = req.session.user.id;
    const reviewImage = req.file ? req.file.buffer : null;

    try {
        const connection = await getConnection();
        await connection.execute(
            'INSERT INTO reviews (place_id, user_id, text, image) VALUES (?, ?, ?, ?)', 
            [placeId, userId, reviewText, reviewImage]
        );
        await connection.end();
        res.redirect(`/place/${placeId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/review/:id/delete', async (req, res) => {
    const reviewId = req.params.id;
    
    try {
        const connection = await getConnection();
        await connection.execute('DELETE FROM reviews WHERE id = ?', [reviewId]);
        await connection.end();

        // Redirect back to the previous page
        res.redirect('back');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/review/:id/edit', async (req, res) => {
    const reviewId = req.params.id;
    try {
        const connection = await getConnection();
        const [reviewResults] = await connection.execute('SELECT * FROM reviews WHERE id = ?', [reviewId]);
        await connection.end();

        if (reviewResults.length === 0) {
            return res.status(404).send('Review not found');
        }

        const review = {
            ...reviewResults[0],
            image: reviewResults[0].image ? `data:image/jpeg;base64,${reviewResults[0].image.toString('base64')}` : null
        };

        res.render('editReview', { review });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/review/:id/update', upload.single('reviewImage'), async (req, res) => {
    const reviewId = req.params.id;
    const reviewText = req.body.reviewText;
    const reviewImage = req.file ? req.file.buffer : null;
    const placeId = req.body.placeId;

    console.log("Updating Review ID:", reviewId);  // Log review ID for debugging

    try {
        const connection = await getConnection();
        if (reviewImage) {
            await connection.execute(
                'UPDATE reviews SET text = ?, image = ? WHERE id = ?', 
                [reviewText, reviewImage, reviewId]
            );
        } else {
            await connection.execute(
                'UPDATE reviews SET text = ? WHERE id = ?', 
                [reviewText, reviewId]
            );
        }
        await connection.end();

        console.log("Review updated successfully");  // Log success
        res.redirect(`/place/${placeId}`);
    } catch (error) {
        console.error("Error updating review:", error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/place/:id', async (req, res) => {
    const placeId = req.params.id;
    console.log("Requested Place ID:", placeId);  // Log the requested place ID
    try {
        const connection = await getConnection();
        const [placeResults] = await connection.execute('SELECT * FROM places WHERE id = ?', [placeId]);
        console.log("Place Results:", placeResults);  // Log the query results

        if (placeResults.length === 0) {
            return res.status(404).send('Place not found');
        }

        // Rest of the code
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});


app.post('/add-place', upload.array('images', 4), async (req, res) => {
    const { name, description } = req.body;
    try {
        const connection = await getConnection();
        const [result] = await connection.execute('INSERT INTO places (name, description) VALUES (?, ?)', [name, description]);
        const placeId = result.insertId;

        
        for (let i = 0; i < req.files.length && i < 4; i++) {
            const file = req.files[i];
            const imageData = await fs.promises.readFile(file.path);
            await connection.execute(`UPDATE places SET image${i+1} = ? WHERE id = ?`, [imageData, placeId]);
        }

        await connection.end();
        res.redirect('/places');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});