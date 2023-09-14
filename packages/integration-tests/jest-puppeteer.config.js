const config = {
  launch: {
    headless: Boolean(process.env.CI),
  },
};

export default config;
