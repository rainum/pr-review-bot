import env from './env.mjs';
import app from './app.mjs';

app.listen(env.PORT, () => {
  console.info(`Server is listening at port ${env.PORT} in ${env.NODE_ENV} mode.`);
});
