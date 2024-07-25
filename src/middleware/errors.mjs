// log error to console
export const logErrors = (err, req, _res, next) => {
  const { message, status } = err;

  if (!status) {
    req.log.fatal(err);
  } else if (status >= 400 && status < 500) {
    req.log.warn(message);
  } else if (status >= 500) {
    req.log.error(message);
  }

  next(err);
};

// send error to client
export const handleErrors = (err, _req, res, _next) => {
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Something went wrong, please try again.' });
};
