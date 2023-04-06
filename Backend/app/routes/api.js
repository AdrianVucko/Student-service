module.exports=function(express,pool,crypto,jwt,secret){

    const apiRouter = express.Router();

    apiRouter.use(function(req, res, next){

        const token = req.body.token || req.params.token || req.headers['x-access-token'] || req.query.token;

        if (token){

            jwt.verify(token, secret, function (err, decoded){

                if (err){

                    if(err.name==='TokenExpiredError') {
                        console.log("Istekao je token");
                        req.decoded={email:"istekao",jmbg:"istekao",level:0};
                        next();
                    }
                    else {
                        return res.status(403).send({
                            success: false,
                            message: 'Wrong token'
                        });
                    }

                } else {

                    console.log(decoded)
                    req.decoded=decoded;
                    next();

                }

            });


        } else {

            return res.status(403).send({
                success:false,
                message:'No token'
            });

        }


    });

    apiRouter.route('/').get(async function(req,res){

        try {
            let conn = await pool.then(function(p){

                return  p.getConnection()

            });

            let rows = await conn.query('SELECT nastavnici.*,ag.svizatog FROM nastavnici NATURAL JOIN (' +
                'SELECT jmbg,GROUP_CONCAT(idkolegij) svizatog FROM nastavnicikolegiji GROUP BY 1) AS ag');
            rows.forEach(val => {
                val['svizatog']= val['svizatog'].toString().split(',').map(value => parseInt(value));
            });

            let rowsDva = await conn.query('SELECT studenti.*,ag.svizatog FROM studenti NATURAL JOIN (' +
                'SELECT jmbag,GROUP_CONCAT(id) svizatog FROM studentikolegiji GROUP BY 1) AS ag');
            rowsDva.forEach(val => {
                val['svizatog']= val['svizatog'].toString().split(',').map(value => parseInt(value));
            });

            let rowsTri = await conn.query('SELECT kolegiji.*,smjerovi.naziv AS druginaziv FROM kolegiji INNER JOIN smjerovi ON kolegiji.idsmjer=smjerovi.id');
            conn.release();

            res.json({ status: 'OK', nastavnicis:rows, studentis: rowsDva, kolegijs: rowsTri});

        } catch (e){
            console.log(e);
            return res.json({"code" : 100, "status" : "Error with query"});

        }


    }).post(async function(req,res){

        if(req.body.tip==='student'){
            const student = {
                jmbag : req.body.jmbag,
                name : req.body.ime,
                dateOfUpis: req.body.datumupisa,
                surname: req.body.prezime,
                idjevi: req.body.svizatog
            };

            try {

                let conn = await pool.then(function(p){

                    return  p.getConnection()

                });

                let q = await conn.query('INSERT INTO studenti (jmbag,ime,prezime,datumupisa) VALUES (?,?,?,CURRENT_DATE())',
                    [student.jmbag,student.name,student.surname]);

                for(let num of student.idjevi){
                    let qS= await conn.query('INSERT INTO studentikolegiji (jmbag,id) VALUES (?,?)',
                        [student.jmbag,num])
                }
                conn.release();
                res.json({ status: 'OK', insertId:q.insertId });

            } catch (e){
                console.log(e);
                res.json({ status: 'NOT OK' });
            }
        }
        else if(req.body.tip==='kolegij'){
            const kolegij={
                id: req.body.id,
                naziv: req.body.naziv,
                opis: req.body.opis,
                idSmjer: req.body.idSmjer,
                nazivSmjera: req.body.nazivSmjera
            }

            try {

                let conn = await pool.then(function(p){

                    return  p.getConnection()

                });

                let q = await conn.query('INSERT INTO kolegiji (id,naziv,opis,idsmjer) VALUES (?,?,?,?)',
                    [kolegij.id,kolegij.naziv,kolegij.opis,kolegij.idSmjer]);

                conn.release();
                res.json({ status: 'OK', insertId:q.insertId });

            } catch (e){
                console.log(e);
                res.json({ status: 'NOT OK' });
            }
        }
        else{
            res.json({ status: 'NOT OK, NOTHING HAPPENED' });
        }

    }).put(async function(req, res){
        if(req.body.tipEntite==='Student'){
            const student={
                jmbag: req.body.jmbag,
                ime: req.body.ime,
                prezime: req.body.prezime,
                dateOfUpis: req.body.datumupisa
            }
            try{
                let conn = await pool.then(function(p){
                    return  p.getConnection()
                });

                let q= await conn.query('UPDATE studenti SET ime=?,prezime=?,datumupisa= ? WHERE jmbag=?',[student.ime,student.prezime,student.dateOfUpis,student.jmbag]);
                conn.release();
                res.json({ status: 'OK', changedRows:q.changedRows });
            }catch (e){
                console.log(e);
                return res.json({"code" : 100, "status" : "Error with query"});
            }
        }
        else if(req.body.tipEntite==='Kolegij'){
            const kolegij={
                id: req.body.id,
                naziv: req.body.naziv,
                opis: req.body.opis,
                idSmjer: req.body.idSmjer,
                nazivSmjera: req.body.nazivSmjera
            }
            try{
                let conn = await pool.then(function(p){
                    return  p.getConnection()
                });

                let q= await conn.query('UPDATE kolegiji SET naziv=?, opis=? WHERE id=?',[kolegij.naziv,kolegij.opis,kolegij.id]);
                let s= await conn.query('UPDATE smjerovi SET naziv=? WHERE id=?',[kolegij.nazivSmjera,kolegij.idSmjer])
                conn.release();
                res.json({ status: 'OK', changedRowsKolegiji:q.changedRows, changedRowsSmjerovi: s.changedRows});
            }catch (e){
                console.log(e);
                return res.json({"code" : 100, "status" : "Error with query"});
            }
        }
        else if(req.body.tipEntite==='Nastavnik'){
            const nastavnik={
                jmbg: req.body.jmbg,
                ime: req.body.ime,
                prezime: req.body.prezime,
                level: req.body.level,
                email: req.body.email
            }
            try{
                let conn = await pool.then(function(p){
                    return  p.getConnection()
                });

                let q= await conn.query('UPDATE nastavnici SET level=? WHERE jmbg=?',[1,nastavnik.jmbg]);

                conn.release();
                res.json({ status: 'OK', changedRowsNastavnik:q.changedRows});
            }catch (e){
                console.log(e);
                return res.json({"code" : 100, "status" : "Error with query"});
            }
        }
        else{
            res.json({ status: 'NOT OK, NOTHING HAPPENED' });
        }
    })

    apiRouter.route('/:prviid/:id').delete(async function(req,res){

        if(req.params.prviid==='student'){
            try {

                let conn = await pool.then(function(p){
                    return  p.getConnection()
                });

                let r= await conn.query('DELETE FROM studentikolegiji WHERE jmbag = ?', req.params.id);

                let q = await conn.query('DELETE FROM studenti WHERE jmbag = ?', req.params.id);
                conn.release();
                res.json({ status: 'OK', affectedRowsKolegiji: r.affectedRows, affectedRowsStudenti :q.affectedRows });

            } catch (e){
                res.json({ status: 'NOT OK' });
            }
        }
        else if(req.params.prviid==='kolegij'){
            try {

                let conn = await pool.then(function(p){
                    return  p.getConnection()
                });

                let r= await conn.query('DELETE FROM studentikolegiji WHERE id = ?', parseInt(req.params.id));
                let f= await conn.query('DELETE FROM nastavnicikolegiji WHERE idkolegij = ?', parseInt(req.params.id));

                let q = await conn.query('DELETE FROM kolegiji WHERE id = ?', parseInt(req.params.id));
                conn.release();
                res.json({ status: 'OK', affectedRowsKolegijiStudenti: r.affectedRows, affectedRowsKolegijiNastavnici: f.affectedRows , affectedRowsStudenti :q.affectedRows });

            } catch (e){
                res.json({ status: 'NOT OK' });
            }
        }
        else{
            res.json({ status: 'NOT OK, NOTHING HAPPENED' });
        }

    });

    apiRouter.route('/detalji/:id').get(async function(req,res){

        try {

            let conn = await pool.then(function(p){

                return  p.getConnection()

            });

            let rows = await conn.query('SELECT nastavnici.*,ag.svizatog FROM nastavnici NATURAL JOIN (' +
                'SELECT jmbg,GROUP_CONCAT(idkolegij) svizatog FROM nastavnicikolegiji GROUP BY 1) AS ag');
            rows.forEach(val => {
                val['svizatog']= val['svizatog'].toString().split(',').map(value => parseInt(value));
            });

            let rowsDva = await conn.query('SELECT studenti.*,ag.svizatog FROM studenti NATURAL JOIN (' +
                'SELECT jmbag,GROUP_CONCAT(id) svizatog FROM studentikolegiji GROUP BY 1) AS ag');
            rowsDva.forEach(val => {
                val['svizatog']= val['svizatog'].toString().split(',').map(value => parseInt(value));
            });

            let rowsTri = await conn.query('SELECT kolegiji.*,smjerovi.naziv AS druginaziv FROM kolegiji INNER JOIN smjerovi ON kolegiji.idsmjer=smjerovi.id');
            conn.release();

            res.json({ status: 'OK', nastavnicis:rows, studentis: rowsDva, kolegijs: rowsTri});


        } catch (e){
            console.log(e);
            return res.json({"code" : 100, "status" : "Error with query"});
        }


    });

    apiRouter.route('/izmjena/:id/:iddva').get(async function(req,res){

        try {

            let conn = await pool.then(function(p){

                return  p.getConnection()

            });

            let idj= req.params.id;
            let iden= req.params.iddva;
            if(idj==='kolegiji') iden= parseInt(iden);

            if(idj==='studenti'){
                let rowsDva= await conn.query('SELECT studenti.*,ag.svizatog FROM studenti NATURAL JOIN (' +
                    'SELECT jmbag,GROUP_CONCAT(id) svizatog FROM studentikolegiji GROUP BY 1) AS ag WHERE studenti.jmbag=?',[iden]);
                rowsDva.forEach(val => {
                    val['svizatog']= val['svizatog'].toString().split(',').map(value => parseInt(value));
                });
                res.json({ status: 'OK',studentis: rowsDva[0]});
            }
            else if(idj==='nastavnici'){
                let rows = await conn.query('SELECT nastavnici.*,ag.svizatog FROM nastavnici NATURAL JOIN (' +
                    'SELECT jmbg,GROUP_CONCAT(idkolegij) svizatog FROM nastavnicikolegiji GROUP BY 1) AS ag WHERE nastavnici.jmbg=?',[iden]);
                rows.forEach(val => {
                    val['svizatog']= val['svizatog'].toString().split(',').map(value => parseInt(value));
                });
                res.json({ status: 'OK', nastavnicis:rows[0]});
            }
            else if(idj==='kolegiji'){
                let rowsTri = await conn.query('SELECT kolegiji.*,smjerovi.naziv AS nazivSmjera FROM kolegiji INNER JOIN smjerovi ON kolegiji.idsmjer=smjerovi.id WHERE kolegiji.id=?',[iden]);
                res.json({ status: 'OK', kolegijs: rowsTri[0]});
            }
            else res.json({ status: 'NOT OK'});

        } catch (e){
            console.log(e);
            return res.json({"code" : 100, "status" : "Error with query"});
        }


    }).post(async function(req, res){
        try {

            let conn = await pool.then(function(p){

                return  p.getConnection()

            });

            let idj= req.params.id;
            let iden= req.params.iddva;

            if(idj==='nastavnici'){
                let q= await conn.query('INSERT INTO nastavnicikolegiji (jmbg,idkolegij) VALUES (?,?)',[iden,req.body.idKolegija])

                conn.release();
                res.json({ status: 'OK', insertId:q.insertId });
            }
            else if(idj==='studenti'){
                let q= await conn.query('INSERT INTO studentikolegiji (jmbag,id) VALUES (?,?)',[iden,req.body.idKolegija])

                conn.release();
                res.json({ status: 'OK', insertId:q.insertId });
            }
            else if(idj==='kolegiji'){
                if(req.body.idNastavnikaIliStudenta.length === 13){
                    let q= await conn.query('INSERT INTO nastavnicikolegiji (jmbg,idkolegij) VALUES (?,?)',[req.body.idNastavnikaIliStudenta,parseInt(iden)])

                    conn.release();
                    res.json({ status: 'OK', insertId:q.insertId });
                }
                else if(req.body.idNastavnikaIliStudenta.length === 10){
                    let q= await conn.query('INSERT INTO studentikolegiji (jmbag,id) VALUES (?,?)',[req.body.idNastavnikaIliStudenta,parseInt(iden)])

                    conn.release();
                    res.json({ status: 'OK', insertId:q.insertId });
                }
                else res.json({ status: 'NOT OK, WRONG PARAMETER LENGTH'});
            }
            else res.json({ status: 'NOT OK'});

        } catch (e){
            console.log(e);
            return res.json({"code" : 100, "status" : "Error with query"});
        }
    });

    apiRouter.route('/izmjena/:id/:iddva/:idtri').delete(async function(req, res){
        if(req.params.id==='studenti'){
            try {

                let conn = await pool.then(function(p){
                    return  p.getConnection()
                });

                let r= await conn.query('DELETE FROM studentikolegiji WHERE jmbag = ? AND id=?', [req.params.iddva,parseInt(req.params.idtri)]);

                conn.release();
                res.json({ status: 'OK', affectedRowsKolegiji: r.affectedRows });

            } catch (e){
                res.json({ status: 'NOT OK' });
            }
        }
        else if(req.params.id==='nastavnici'){
            try {

                let conn = await pool.then(function(p){
                    return  p.getConnection()
                });

                let f= await conn.query('DELETE FROM nastavnicikolegiji WHERE jmbg=? AND idkolegij = ?', [req.params.iddva,parseInt(req.params.idtri)]);

                conn.release();
                res.json({ status: 'OK', affectedRowsKolegijiNastavnici: f.affectedRows });

            } catch (e){
                res.json({ status: 'NOT OK' });
            }
        }
        else if(req.params.id==='kolegiji'){
            if(req.params.idtri.length === 13){
                try {

                    let conn = await pool.then(function(p){
                        return  p.getConnection()
                    });

                    let f= await conn.query('DELETE FROM nastavnicikolegiji WHERE idkolegij=? AND jmbg = ?', [parseInt(req.params.iddva),req.params.idtri]);

                    conn.release();
                    res.json({ status: 'OK', affectedRowsKolegijiNastavnici: f.affectedRows });

                } catch (e){
                    res.json({ status: 'NOT OK' });
                }
            }
            else if(req.params.idtri.length === 10){
                try {

                    let conn = await pool.then(function(p){
                        return  p.getConnection()
                    });

                    let r= await conn.query('DELETE FROM studentikolegiji WHERE id = ? AND jmbag=?', [parseInt(req.params.iddva),req.params.idtri]);

                    conn.release();
                    res.json({ status: 'OK', affectedRowsKolegiji: r.affectedRows });

                } catch (e){
                    res.json({ status: 'NOT OK' });
                }
            }
            else res.json({ status: 'NOT OK, WRONG PARAMETER LENGTH'});
        }
        else{
            res.json({ status: 'NOT OK, NOTHING HAPPENED' });
        }
    });

    apiRouter.get('/me', function (req, res){

        res.send({status:200, user:req.decoded});
    });

    return apiRouter;


};