import dotenv from 'dotenv'
const myEnv = dotenv.config()

let config

if(myEnv.parsed.config === 'dev'){
  config = {
    db: {
      url: 'mongodb://localhost:27017/CineRoom'
    }
  }
}
else if(myEnv.parsed.config === 'prod') {
  config = {
    db: {
      url: `mongodb+srv://${myEnv.parsed.dbUSER}:${myEnv.parsed.dbPASSWORD}@${myEnv.parsed.dbURL}/${myEnv.parsed.dbNAME}?retryWrites=true&w=majority`
    }
  }
}

console.log(process);

export default config