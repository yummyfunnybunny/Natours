// adds a wrapper function that allows us to pass in a callback function into our async/await functions
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
