#!/bin/bash

# Carrega variáveis do .env 
set -a
source .env
set +a

ssh -T "${SERVER_USER}@${SERVER_IP}" << EOF
  set -e

  mkdir -p "${RUNNER_DIR}" && cd "${RUNNER_DIR}"

  curl -o actions-runner-linux-x64-2.321.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.321.0/actions-runner-linux-x64-2.321.0.tar.gz

  tar xzf ./actions-runner-linux-x64-2.321.0.tar.gz

  ./config.sh \
    --url "${REPO_URL}" \
    --token "${RUNNER_TOKEN}" \
    --name "${RUNNER_NAME}" \
    --unattended \
    --replace

  sudo ./svc.sh install
  sudo ./svc.sh start

  echo "=== Runner instalado e rodando com sucesso! ==="
EOF