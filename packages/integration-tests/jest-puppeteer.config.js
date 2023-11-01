const config = {
  launch: {
    headless: Boolean(process.env.CI),
    args: ['--accept-lang="en"'],
  },
};

export default config;
