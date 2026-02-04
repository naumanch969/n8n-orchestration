---
description: Deploy n8n to Oracle Cloud Always Free Tier
---

# Deploy n8n to Oracle Cloud Always Free

This workflow guides you through deploying n8n on Oracle Cloud's generous Always Free tier (4 ARM vCPUs, 24GB RAM).

## Prerequisites
- Oracle Cloud account (free tier)
- SSH client on your Mac (built-in)
- Domain name (optional, but recommended for webhooks)

## Phase 1: Oracle Cloud Setup

### 1. Create Oracle Cloud Account
- Go to https://www.oracle.com/cloud/free/
- Sign up for Always Free account
- Complete verification (requires credit card for identity verification, but won't be charged)

### 2. Create Compute Instance
- Navigate to: **Compute** → **Instances** → **Create Instance**
- **Name**: `n8n-production`
- **Image**: Ubuntu 22.04 Minimal (ARM-based)
- **Shape**: VM.Standard.A1.Flex
  - OCPUs: 4
  - Memory: 24 GB
- **Networking**: 
  - Create new VCN (Virtual Cloud Network) if you don't have one
  - Assign public IP: Yes
- **SSH Keys**: 
  - Generate a key pair (download both private and public keys)
  - Save private key to `~/.ssh/oracle-n8n.key`
- Click **Create**

### 3. Configure Firewall Rules
- Go to **Networking** → **Virtual Cloud Networks** → Your VCN → **Security Lists** → **Default Security List**
- Add Ingress Rules:
  - **Rule 1 (HTTP)**: Source: 0.0.0.0/0, Protocol: TCP, Port: 80
  - **Rule 2 (HTTPS)**: Source: 0.0.0.0/0, Protocol: TCP, Port: 443
  - **Rule 3 (n8n)**: Source: 0.0.0.0/0, Protocol: TCP, Port: 5678

### 4. Configure Ubuntu Firewall
```bash
# SSH into your instance first
chmod 600 ~/.ssh/oracle-n8n.key
ssh -i ~/.ssh/oracle-n8n.key ubuntu@<YOUR_INSTANCE_PUBLIC_IP>

# Once connected, run:
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 5678 -j ACCEPT
sudo netfilter-persistent save
```

## Phase 2: Install Dependencies

### 5. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 6. Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Start Docker on boot
sudo systemctl enable docker

# Log out and back in for group changes to take effect
exit
# Then SSH back in
```

### 7. Install Docker Compose
```bash
sudo apt install docker-compose -y
```

## Phase 3: Deploy n8n

### 8. Create n8n Directory Structure
```bash
mkdir -p ~/n8n-docker
cd ~/n8n-docker
```

### 9. Create Docker Compose File
```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: n8n_secure_password_change_this
      POSTGRES_DB: n8n
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U n8n']
      interval: 5s
      timeout: 5s
      retries: 10

  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=n8n_secure_password_change_this
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=change_this_password
      - N8N_HOST=0.0.0.0
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://<YOUR_INSTANCE_PUBLIC_IP>:5678/
      - GENERIC_TIMEZONE=Asia/Karachi
      - N8N_METRICS=true
    volumes:
      - n8n-data:/home/node/.n8n
      - /home/ubuntu/n8n-files:/files
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres-data:
  n8n-data:
EOF
```

### 10. Configure Environment Variables
```bash
# Edit the docker-compose.yml file
nano docker-compose.yml

# Replace:
# - <YOUR_INSTANCE_PUBLIC_IP> with your actual IP
# - n8n_secure_password_change_this with a strong password
# - change_this_password with a strong admin password
```

### 11. Create Shared Files Directory
```bash
mkdir -p ~/n8n-files
```

### 12. Start n8n
```bash
cd ~/n8n-docker
docker-compose up -d
```

### 13. Verify Installation
```bash
# Check if containers are running
docker-compose ps

# View logs
docker-compose logs -f n8n
```

## Phase 4: Access n8n

### 14. Access via Browser
- Open: `http://<YOUR_INSTANCE_PUBLIC_IP>:5678`
- Login with credentials from docker-compose.yml

### 15. Enable Public API
- Go to **Settings** → **Public API**
- Toggle ON
- Create API Key
- Save this key securely

## Phase 5: Setup File System Integration (DO Architecture)

### 16. Create DO Directory Structure on Server
```bash
ssh -i ~/.ssh/oracle-n8n.key ubuntu@<YOUR_INSTANCE_PUBLIC_IP>

mkdir -p ~/n8n-files/directives
mkdir -p ~/n8n-files/executions
mkdir -p ~/n8n-files/orchestration
```

### 17. Sync Local Files to Server
```bash
# From your Mac, run:
scp -i ~/.ssh/oracle-n8n.key -r /Users/apple/Documents/n8n/directives ubuntu@<YOUR_INSTANCE_PUBLIC_IP>:~/n8n-files/
scp -i ~/.ssh/oracle-n8n.key -r /Users/apple/Documents/n8n/executions ubuntu@<YOUR_INSTANCE_PUBLIC_IP>:~/n8n-files/
```

### 18. Configure n8n to Access Files
In n8n workflows, use the **Read/Write Files from Disk** node with paths:
- Directives: `/files/directives/`
- Executions: `/files/executions/`
- Orchestration: `/files/orchestration/`

## Phase 6: Optional - Setup Domain & SSL

### 19. Point Domain to Instance
- Add an A record in your DNS provider pointing to your Oracle instance IP

### 20. Install Caddy (Automatic SSL)
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

### 21. Configure Caddy
```bash
sudo nano /etc/caddy/Caddyfile

# Add:
your-domain.com {
    reverse_proxy localhost:5678
}

# Save and restart
sudo systemctl restart caddy
```

### 22. Update n8n Environment
```bash
cd ~/n8n-docker
nano docker-compose.yml

# Change:
# - N8N_PROTOCOL=https
# - WEBHOOK_URL=https://your-domain.com/

docker-compose down
docker-compose up -d
```

## Maintenance Commands

### View Logs
```bash
cd ~/n8n-docker
docker-compose logs -f n8n
```

### Restart n8n
```bash
cd ~/n8n-docker
docker-compose restart n8n
```

### Update n8n
```bash
cd ~/n8n-docker
docker-compose pull
docker-compose up -d
```

### Backup
```bash
# Backup n8n data
docker run --rm -v n8n-docker_n8n-data:/data -v ~/backups:/backup alpine tar czf /backup/n8n-backup-$(date +%Y%m%d).tar.gz /data

# Backup database
docker exec n8n-docker-postgres-1 pg_dump -U n8n n8n > ~/backups/n8n-db-$(date +%Y%m%d).sql
```

---

**Next Steps After Deployment:**
1. Get the API key from n8n settings
2. Use the API to programmatically create workflows
3. Set up automated sync between local development and production
