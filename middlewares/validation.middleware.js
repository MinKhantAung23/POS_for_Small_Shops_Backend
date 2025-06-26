const ApiError = require("../utils/apiError");

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false }); // abortEarly: false collects all errors

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.context.key,
      message: detail.message,
    }));
    // return res.status(400).json({
    //   message: "Validation failed",
    //   errors: errors,
    // });

    return next(new ApiError(400, "Validation failed", errors));
  }
  next();
};

module.exports = validate;
