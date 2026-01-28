# 🚀 Ingestion Service Deployment on AWS EC2

---

## 🧩 Prerequisites

- EC2 instance (Ubuntu 20.04 / 22.04)
- IAM Role attached to EC2 with:
  - Amazon ECR read access
  - AWS Secrets Manager read access
- Docker image pushed to Amazon ECR
- Security Group allowing inbound traffic on port 8000

---

## 🐳 Step 1: Install and Configure Docker

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
exit
```

```bash
docker --version
```

---

## ☁️ Step 2: Install AWS CLI (v2)

```bash
sudo apt install -y awscli unzip curl
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

```bash
aws --version
```

---

## 🔐 Step 3: Login to Amazon ECR

```bash
aws ecr get-login-password --region ap-south-1 \
| docker login --username AWS --password-stdin <ACOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com
```

---

## 📦 Step 4: Pull Ingestion Image

```bash
docker pull <ACOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/ai-agent-ingestion
```

---

## 📁 Step 5: Create Temporary Directory for Ingestion

```bash
sudo mkdir -p /opt/ingestion/tmp
sudo chmod -R 777 /opt/ingestion/tmp
```

---

## ▶️ Step 6: Run Ingestion Container

```bash
docker run -d \
  --name ingestion \
  --restart=always \
  -p 8000:8000 \
  -e NODE_ENV=production \
  -e AWS_REGION=ap-south-1 \
  -e SECRET_NAME=ai-agent/secret \
  <ACOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/ai-agent-ingestion
```

---

## 🔎 Environment Variables

```text
NODE_ENV      -> Environment mode (kept for compatibility)
AWS_REGION   -> AWS region for Secrets Manager
SECRET_NAME  -> Secret name in AWS Secrets Manager
```

---

## ✅ Step 7: Verify Deployment

```bash
docker ps
docker logs ingestion
curl http://<EC2_PUBLIC_IP>:8000/health
```

---

## 🔁 Useful Docker Commands

```bash
docker restart ingestion
docker stop ingestion
docker rm -f ingestion
```
