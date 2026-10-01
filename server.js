
const express=require("express"), path=require("path"), fs=require("fs");
const multer=require("multer"), bcrypt=require("bcryptjs"), jwt=require("jsonwebtoken");
const Database=require("better-sqlite3");
const app=express(), PORT=process.env.PORT||3000;
const SECRET=process.env.JWT_SECRET||"CHANGE_THIS_SECRET_BEFORE_DEPLOYING";
const ADMIN_USER=process.env.ADMIN_USER||"admin";
const ADMIN_PASS=process.env.ADMIN_PASS||"ChangeMe123!";

fs.mkdirSync(path.join(__dirname,"uploads"),{recursive:true});
const db=new Database(path.join(__dirname,"giftriya.db"));
db.exec(`CREATE TABLE IF NOT EXISTS products(
 id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,sku TEXT,category TEXT,
 price REAL NOT NULL,mrp REAL,stock INTEGER DEFAULT 0,image TEXT,description TEXT,
 active INTEGER DEFAULT 1,created_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
const exists=db.prepare("SELECT id FROM products LIMIT 1").get();
if(!exists) db.prepare(`INSERT INTO products(name,sku,category,price,mrp,stock,image,description)
VALUES(?,?,?,?,?,?,?,?)`).run("Sample Gift Product","GIF-001","Gifts",299,499,10,"","Premium sample product — edit or delete this listing.");

const upload=multer({storage:multer.diskStorage({
 destination:(req,file,cb)=>cb(null,path.join(__dirname,"uploads")),
 filename:(req,file,cb)=>cb(null,Date.now()+"-"+file.originalname.replace(/[^a-zA-Z0-9._-]/g,""))
}),limits:{fileSize:5*1024*1024}});

app.use(express.json()); app.use(express.urlencoded({extended:true}));
app.use("/uploads",express.static(path.join(__dirname,"uploads")));
app.use(express.static(path.join(__dirname,"public")));

function auth(req,res,next){
 const h=req.headers.authorization||"";
 try{ const t=h.startsWith("Bearer ")?h.slice(7):""; req.admin=jwt.verify(t,SECRET); next(); }
 catch(e){res.status(401).json({error:"Unauthorized"});}
}
app.post("/api/login",(req,res)=>{
 const {username,password}=req.body;
 if(username===ADMIN_USER && password===ADMIN_PASS){
   return res.json({token:jwt.sign({username},SECRET,{expiresIn:"8h"})});
 }
 res.status(401).json({error:"Invalid login"});
});
app.get("/api/products",(req,res)=>res.json(db.prepare("SELECT * FROM products ORDER BY id DESC").all()));
app.post("/api/products",auth,upload.single("image"),(req,res)=>{
 const {name,sku,category,price,mrp,stock,description}=req.body;
 if(!name||!price) return res.status(400).json({error:"Name and price are required"});
 const image=req.file?"/uploads/"+req.file.filename:"";
 const r=db.prepare(`INSERT INTO products(name,sku,category,price,mrp,stock,image,description,active)
 VALUES(?,?,?,?,?,?,?,?,1)`).run(name,sku||"",category||"General",Number(price),Number(mrp||0),Number(stock||0),image,description||"");
 res.json(db.prepare("SELECT * FROM products WHERE id=?").get(r.lastInsertRowid));
});
app.patch("/api/products/:id",auth,upload.single("image"),(req,res)=>{
 const p=db.prepare("SELECT * FROM products WHERE id=?").get(req.params.id);
 if(!p) return res.status(404).json({error:"Not found"});
 const image=req.file?"/uploads/"+req.file.filename:p.image;
 const {name,sku,category,price,mrp,stock,description,active}=req.body;
 db.prepare(`UPDATE products SET name=?,sku=?,category=?,price=?,mrp=?,stock=?,description=?,image=?,active=? WHERE id=?`)
 .run(name??p.name,sku??p.sku,category??p.category,Number(price??p.price),Number(mrp??p.mrp),Number(stock??p.stock),description??p.description,image,Number(active??p.active),p.id);
 res.json(db.prepare("SELECT * FROM products WHERE id=?").get(p.id));
});
app.delete("/api/products/:id",auth,(req,res)=>{
 db.prepare("DELETE FROM products WHERE id=?").run(req.params.id); res.json({ok:true});
});
app.listen(PORT,()=>console.log(`GIFTRIYA running on http://localhost:${PORT}`));
