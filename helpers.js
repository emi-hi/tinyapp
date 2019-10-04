const getUserByEmail = (database,email) => Object.keys(database).find(id => database[id]["email"] === email);


const urlsForUser = function(user, urlDb) {
  let urlsToDisplay = {};
  const shortUrlsArr = (urlDb,val) => Object.keys(urlDb).filter(key => urlDb[key]["userId"] === val);
  let arr = shortUrlsArr(urlDb, user);
  for (let i of arr) {
    urlsToDisplay[i] = urlDb[i]["longUrl"];
  }
  return urlsToDisplay;
};

const generateRandomString = function(max) {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < max; i++) {
    result += chars[(Math.floor(Math.random() * chars.length))];
  }
  return result;
};

const createDate = function() {
  let d = new Date();
  let fullDate = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + (d.getDate());
  return fullDate;
};
module.exports = { getUserByEmail ,
  urlsForUser,
  generateRandomString,
  createDate
};