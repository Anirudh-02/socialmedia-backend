const Sequelize = require('sequelize')

let db
if (process.env.DATABASE_URL) {
    db = new Sequelize(process.env.DATABASE_URL)
}
else {
    db = new Sequelize({
        dialect: 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        database: process.env.POSTGRES_DB || 'testdb',
        username: process.env.POSTGRES_USER || 'testuser',
        password: process.env.POSTGRES_PASSWORD || 'testpassword',
        logging: false
    })
}


const COL_ID_DEF = {
    type: Sequelize.DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
}

const COL_TITLE_DEF = {
    type: Sequelize.DataTypes.STRING,
    allowNull: false
}

const Users = db.define('user', {
    id: COL_ID_DEF,
    uuid: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV4
    },
    email: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    },
    followers: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: false,
        defaultValue: []
    },
    following: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: false,
        defaultValue: []
    }
})

const Posts = db.define('post', {
    id: COL_ID_DEF,
    uuid: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV4
    },
    title: COL_TITLE_DEF,
    desc: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false
    },
    comments: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: []
    },
    likes: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: false,
        defaultValue: []
    }
})


Users.hasMany(Posts)
Posts.belongsTo(Users)


module.exports = {
    db,
    Users,
    Posts,
}