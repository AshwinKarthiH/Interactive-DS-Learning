FROM ubuntu:24.04
RUN apt-get update && apt-get install -y --no-install-recommends python3 nodejs gcc g++ openjdk-21-jdk-headless && rm -rf /var/lib/apt/lists/*
COPY vendor /opt/judge/vendor
COPY worker.py /opt/judge/worker.py
COPY JavaRunner.java /opt/judge/JavaRunner.java
USER 10001:10001
WORKDIR /work
ENTRYPOINT ["python3", "-I", "/opt/judge/worker.py"]
