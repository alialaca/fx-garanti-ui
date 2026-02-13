FROM node:22-alpine

WORKDIR /app

COPY .output .output

EXPOSE 3000

ENV APP_HOST=0.0.0.0
ENV APP_PORT=3000

CMD ["node", ".output/server/index.mjs"]