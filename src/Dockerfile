FROM python:3.12.1-alpine
#FROM tiangolo/uvicorn-gunicorn-fastapi:python3.12

WORKDIR /code/src

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY ./requirements.txt /code/src/requirements.txt

RUN set -eux \
    && apk add --no-cache --virtual .build-deps python3 py3-pip \
    && apk add chromium \
    && pip install --upgrade pip setuptools wheel \
    && pip install fastapi uvicorn \
    && pip install -r /code/src/requirements.txt \
    && rm -rf /root/.cache/pip


#RUN apk add openssl curl ca-certificates && printf "%s%s%s%s\n" \
#    "@nginx " "http://nginx.org/packages/alpine/v" `egrep -o '^[0-9]+\.[0-9]+' /etc/alpine-release` \
#    "/main" | tee -a /etc/apk/repositories \ 
#    && curl -o /tmp/nginx_signing.rsa.pub https://nginx.org/keys/nginx_signing.rsa.pub \ 
#    && openssl rsa -pubin -in /tmp/nginx_signing.rsa.pub -text -noout \
#    && mv /tmp/nginx_signing.rsa.pub /etc/apk/keys/ \
#    && apk add nginx@nginx


#COPY ./proxy-8000.conf /etc/nginx/sites-available/proxy-8000.conf
#COPY ./proxy-8000.conf /etc/nginx/conf.d/proxy-8000.conf
#RUN chmod 755 /etc/nginx/sites-available/proxy-8000.conf
#RUN chmod 755 /etc/nginx/sites-available/proxy-8000.conf
#RUN nginx -c /etc/nginx/nginx.conf
#RUN mkdir /etc/nginx/sites-enabled/
#RUN ln -s /etc/nginx/sites-available/proxy-8000.conf /etc/nginx/sites-enabled/proxy-8000.conf

COPY . /code/src

#CMD python -m db.init_db; nginx; uvicorn core.api.external.init_api:app --proxy-headers --host 0.0.0.0
CMD python -m db.init_db; uvicorn core.api.server.init_api:app --host 0.0.0.0 --workers 4