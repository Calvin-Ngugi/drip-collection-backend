import express from "express";
import mysql from "mysql";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
const salt = 10;

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [process.env.BASE_URL],
    methods: ["POST", "GET"],
    credentials: true,
  })
);
app.use(cookieParser());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "drip_collection",
});

app.post('/register', (req, res) => { 
    const sql = "INSERT INTO users (`name`, `email`, `password`) VALUES (?)";
    bcrypt.hash(req.body.password.toString(), salt, (err, data) => { 
        if (err) return res.json({ Error: "Error for hassing password" });
        const values = [
            req.body.name,
            req.body.email,
            hash
        ]
        db.query(sql, [values], (err, results) => { 
            if (err) return res.json({ Error: "Error for hassing" });
            return res.json({ Status: "Success" });
        })
    })
})

app.post('/login', (req, res) => { 
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [req.body.email], (err, data) => { 
        if (err) return res.json({ Error: "Login server error" });
        if (data.length > 0) {
            bcrypt.compare(req.body.password.toString(), data[0].password, (err, response) => {
                if (err) return res.json({ Error: "Incorrect password" });
                if (response) {
                    const name = data[0].name;
                    const token = jwt.sign({ name }, "jwt-secret-key", { expiresIn: '1d' });
                    res.cookie('token', token);
                    return res.json({ Status: 'Success' });
                } else {
                    return res.json({ Error: "Invalid credentials" });
                }
            })
        } else { 
            return res.json({ Error: "No account found with email" });
        }
    })
})


app.listen(8080, () => {
    console.log('Running...');
});