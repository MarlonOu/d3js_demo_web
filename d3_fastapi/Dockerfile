FROM python:3.11-slim-buster

COPY . /fastapi

WORKDIR /fastapi

RUN pip install -r requirements.txt  \
    && rm -rf /root/.cache/pip

EXPOSE 8000

# ENV NAME World

WORKDIR /fastapi/src/app

CMD uvicorn main:app --host '0.0.0.0'
