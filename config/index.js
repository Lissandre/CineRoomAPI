import dotenv from 'dotenv'
const myEnv = dotenv.config()

let config

if(process.env.config === 'dev'){
  config = {
    db: {
      url: 'mongodb://localhost:27017/CineRoom'
    }
  }
}
else if(process.env.config === 'prod') {
  config = {
    db: {
      url: `mongodb+srv://${process.env.dbUSER}:${process.env.dbPASSWORD}@${process.env.dbURL}/${process.env.dbNAME}?retryWrites=true&w=majority`
    }
  }
}

export default config