const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role_id)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden, Access denied",
      });
    }
    next();
  };
};

module.exports = authorizeRoles;
