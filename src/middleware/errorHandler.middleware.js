const errorHandler = function (err, req, res, next) {
  //   console.log(err);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).json({ ...err });
  next(err);
};

export { errorHandler };
