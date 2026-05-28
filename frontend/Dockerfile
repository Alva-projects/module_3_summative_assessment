FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.template.html

ENV API_URL=http://localhost:3000

CMD ["/bin/sh", "-c", "envsubst '${API_URL}' < /usr/share/nginx/html/index.template.html > /usr/share/nginx/html/index.html && nginx -g 'daemon off;'"]
