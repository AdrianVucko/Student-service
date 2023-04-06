module.exports=function(express, pool, jwt, secret, crypto){


    let authRouter = express.Router();

    authRouter.route('/login').get(async function(req,res){

        try {

            let conn = await pool.then(function(p){

                return  p.getConnection()

            });
            let rows = await conn.query('SELECT * FROM nastavnici');

            conn.release();
            res.json({ status: 'OK', usersi: rows});

        } catch (e){
            console.log(e);
            return res.body.json({"code" : 100, "status" : "Error with query"});

        }



    })

    authRouter.route('/register').get(async function(req,res){
        try {

            let conn = await pool.then(function(p){

                return  p.getConnection()

            });
            let rows = await conn.query('SELECT * FROM nastavnici');
            let rowsDva= await conn.query('SELECT kolegiji.*,smjerovi.naziv AS druginaziv FROM kolegiji INNER JOIN smjerovi ON kolegiji.idsmjer=smjerovi.id');
            conn.release();
            res.json({ status: 'OK', usersi:rows, kolegijs:rowsDva});

        } catch (e){
            console.log(e);
            return res.json({"code" : 100, "status" : "Error with query"});

        }



    }).post(async function(req,res){

        const user = {
            jmbg : req.body.jmbg,
            password : req.body.password,
            email : req.body.email,
            name : req.body.name,
            surname: req.body.surname,
            idjevi: req.body.kolegijsi
        };

        try {

            let conn = await pool.then(function(p){

                return  p.getConnection()

            });
            let salt = crypto.randomBytes(128).toString('base64');
            let hash = crypto.pbkdf2Sync(req.body.password, salt, 10000, 64, 'sha512');

            console.log(hash.toString('hex'));
            console.log(salt);
            let q = await conn.query('INSERT INTO nastavnici (jmbg,email,ime,prezime,lozinka,salt,level) VALUES (?,?,?,?,?,?,?)',
                [user.jmbg,user.email,user.name,user.surname,hash.toString('hex'),salt,2]);

            for(let num of user.idjevi){
                let qS= await conn.query('INSERT INTO nastavnicikolegiji (jmbg,idkolegij) VALUES (?,?)',
                    [user.jmbg,num])
            }
            conn.release();
            res.json({ status: 'OK', insertId:q.insertId });

        } catch (e){
            console.log(e);
            res.json({ status: 'NOT OK' });
        }

    });

    authRouter.post('/', async function(req,res){



        try {

            console.log(req.body);

            let conn = await pool.then(function(p){
                return  p.getConnection()
            });
            let rows = await conn.query('SELECT * FROM nastavnici WHERE email=?', req.body.email);
            conn.release();

            if (rows.length>0){

                let hash = crypto.pbkdf2Sync(req.body.password, rows[0].salt, 10000, 64, 'sha512');

                console.log(hash.toString('hex'));
                console.log(rows[0].lozinka);

                if(hash.toString('hex')==rows[0].lozinka){
                    const token = jwt.sign({
                        jmbg:rows[0].jmbg,
                        email:rows[0].email,
                        level: rows[0].level
                    }, secret, {
                        expiresIn:1200
                    });
                    res.json({ status: 200, token:token, user:rows[0]});
                }
                else{

                    res.json({ status: 'NOT OK', description:'Wrong password' });

                }

            } else {

                res.json({ status: 'NOT OK', description:'Email doesnt exist' });

            }


        } catch (e){
            console.log(e);
            return res.json({"code" : 100, "status" : "Error with query"});

        }



    });


    return authRouter;

};