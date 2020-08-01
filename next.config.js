module.exports = {
  experimental: {
    amp: {
      skipValidation: process.env.NODE_ENV === "development" ? true : false,
    },
  },
};
