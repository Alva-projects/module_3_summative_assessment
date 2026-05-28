const logDatabase = [];

const logger = (req, res, next) => {
  // Store log in "database"
  logDatabase.push({
    method: req.method,
    url: req.url,
    time: new Date().toISOString(),
  });

  console.log(logDatabase);

  next();
};

module.exports = logger;
