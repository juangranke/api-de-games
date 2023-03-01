const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const cors = require("cors")
const jwt = require("jsonwebtoken")


const JWTSecret = "dlajsbnd908ahq3ind09918h091d432423napksnd/3IYR098yrA/LRIN3Ao'f8ha08hfgÍHRda;llkshndpoq33]Q8RY"


app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//Middleware
function auth(req, res, next){

    const authToken = req.headers['authorization']

    if (authToken != undefined) {

        const bearer = authToken.split(' ')
        var token = bearer[1]

        jwt.verify(token, JWTSecret, (err, data) => {
            if (err){
                res.status(401)
                res.json({err: "Token inválido"})
            } else {

                req.token = token
                req.loggedUser = {id: data.id, email: data.email}
                req.empresa = "Guia do Programador"
                next()            
            }
        })

    } else {
        res.status(401)
        res.json({err: "Token inválido!"})
    }
    

}

var DB = {
    games:[
        {
            id: 23,
            title: "Call of Duty MW",
            year: 2019,
            price: 60
        },
        {
            id: 65,
            title: "Sea of Thieves",
            year: 2018,
            price: 40
        },
        {
            id: 2,
            title: "Minecraft",
            year: 2012,
            price: 20
        }
    ],
    users: [
        {
            id: 1,
            name: "Juan Granke",
            email: "juangranke@outlook.com",
            password: 123
        },
        {
            id: 78,
            name: "Bianca Souza",
            email: "acanisaj@gmail.com",
            password: 321
        }
    ]
}

app.get("/games", auth, (req, res) => {

    var HATEOAS = [
        {
            href: "http://localhost:3663/game/0", // O link em si
            method: "DELETE", // O método que é realizado tudo em letra maiuscula.
            rel: "delete_game"//Descrição

        },
        {
            href: "http://localhost:3663/game/0", 
            method: "GET", 
            rel: "get_game"
        },
        {
            href: "http://localhost:3663/auth", 
            method: "POST", 
            rel: "login"
        }
    ]



    req.loggedUser
    res.statusCode = 200
    res.json({games: DB.games, _links: HATEOAS})
})

app.get("/game/:id", auth, (req, res) => {
    if (isNaN(req.params.id)){
        res.sendStatus(400)
    } else {
        var id = parseInt(req.params.id)

        var HATEOAS = [
            {
                href: "http://localhost:3663/game/"+id, // O link em si
                method: "DELETE", // O método que é realizado tudo em letra maiuscula.
                rel: "delete_game"//Descrição
    
            },
            {
                href: "http://localhost:3663/game/"+id, 
                method: "GET", 
                rel: "get_game"
            },
            {
                href: "http://localhost:3663/auth", 
                method: "POST", 
                rel: "login"
            }
        ]

        var game = DB.games.find(g => g.id == id)

        if (game != undefined){
            res.statusCode = 200
            res.json(game)
        } else {
            res.sendStatus(404)
        }

    }
})


app.post("/game", auth, (req, res) => {
    var {title, price, year} = req.body
    DB.games.push({
        id: 232,
        title,
        price,
        year 
    })
    res.sendStatus(200)
})

app.delete("/game/:id", auth, (req, res) => {

    if (isNaN(req.params.id)){
        res.sendStatus(400)
    } else {
        var id = parseInt(req.params.id)
        var index = DB.games.findIndex(g => g.id == id)

        if (index == -1){
            res.sendStatus(404)
        } else {
            DB.games.splice(index, 1)
            res.sendStatus(200);
        }

    }

})



app.put("/game/:id", auth, (req, res) => {
    if (isNaN(req.params.id)){
        res.sendStatus(400)
    } else {
        var id = parseInt(req.params.id)

        var HATEOAS = [
            {
                href: "http://localhost:3663/game/"+id, // O link em si
                method: "DELETE", // O método que é realizado tudo em letra maiuscula.
                rel: "delete_game"//Descrição
    
            },
            {
                href: "http://localhost:3663/game/"+id, 
                method: "PUT", 
                rel: "edit_game"
            },
            {
                href: "http://localhost:3663/auth", 
                method: "POST", 
                rel: "login"
            },
            {
                href: "http://localhost:3663/games", 
                method: "GET", 
                rel: "get_all_games"
            }
        ]

        var game = DB.games.find(g => g.id == id)

        if (game != undefined){
            
            var {title, price, year} = req.body;

            if(title != undefined) {
                game.title = title;
            }

            if (price != undefined) {
                game.price = price;
            }

            if (year != undefined) {
                game.year = year;
            }

            res.sendStatus(200)

        } else {
            res.sendStatus(404)
        }

    }
})



app.post("/auth", (req, res) => {

    var {email, password} = req.body; // Isso porque os dados ver do corpo da requisição que o usuário manda.

    if(email != undefined){
        var user = DB.users.find(u => u.email == email)

        if (user != undefined) {

            if(user.password == password){

                jwt.sign({id: user.id, email: user.email}, JWTSecret, {expiresIn: '48h'}, (err, token) => {
                    if (err){
                        res.status(400);
                        res.json({err: "Falha interna"})
                    } else {
                        res.status(200)
                        res.json({token: token})
                    }
                })
            } else {
                res.status(401)
                res.json({err: "Credenciais inválidas"})
            }



        } else {
            res.status(404)
            res.json({err: "O e-mail enviado não existe nada base de dados!"})
        }

    } else{
        res.status(400)
        res.json({err: "O e-mail enviado é inválido!"})
    }

})




app.listen(3663, () => {
    console.log("API rodando!")
})