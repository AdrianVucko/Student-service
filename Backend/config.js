module.exports={

      port:  process.env.PORT || 8081,
      pool: {
          connectionLimit : 100,
          host     : 'localhost',
          user     : 'root',
          password : '',
          database : 'projekt',
          debug    :  false,
          //port: 3307
      },
      secret: "nekidugacakstringzakodiranjetokena"
}