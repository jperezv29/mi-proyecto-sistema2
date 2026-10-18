\# Diagrama de Persistencia Políglota - VotaGT



```mermaid

flowchart TB



&#x20;   U\["👤 Usuario / Cliente"]

&#x20;   API\["🌐 API REST VotaGT<br/>Node.js + Express"]



&#x20;   AUTH\["🔐 Auth Service"]

&#x20;   ELEC\["🗳️ Servicios Electorales"]

&#x20;   RES\["📊 Resultado Service"]



&#x20;   REPO\["Repository Pattern"]

&#x20;   CACHE\["Cache Gateway"]

&#x20;   CB\["Circuit Breaker"]

&#x20;   OBS\["Audit Observer"]

&#x20;   GRAPH\["Autorización Graph"]



&#x20;   PG\[("🐘 PostgreSQL<br/>Datos transaccionales")]

&#x20;   REDIS\[("⚡ Redis<br/>Caché de resultados")]

&#x20;   MONGO\[("🍃 MongoDB<br/>Auditoría")]

&#x20;   NEO\[("🔗 Neo4j<br/>Usuario-Rol-Permiso")]



&#x20;   U --> API



&#x20;   API --> AUTH

&#x20;   API --> ELEC

&#x20;   API --> RES



&#x20;   AUTH --> REPO

&#x20;   ELEC --> REPO

&#x20;   RES --> REPO



&#x20;   REPO --> PG



&#x20;   RES --> CACHE

&#x20;   CACHE --> CB

&#x20;   CB -->|"CACHE HIT"| REDIS

&#x20;   REDIS -->|"Resultado almacenado"| CB



&#x20;   CB -. "Redis no disponible" .-> REPO



&#x20;   RES -->|"Nuevo resultado"| CACHE

&#x20;   CACHE -->|"Invalidar clave"| REDIS



&#x20;   AUTH --> GRAPH

&#x20;   GRAPH --> NEO



&#x20;   AUTH -. "AUDITORIA" .-> OBS

&#x20;   ELEC -. "AUDITORIA" .-> OBS

&#x20;   RES -. "AUDITORIA" .-> OBS



&#x20;   OBS --> MONGO



&#x20;   classDef cliente fill:#E8F4FD,stroke:#5B9BD5,color:#000;

&#x20;   classDef app fill:#EAF7EA,stroke:#70AD47,color:#000;

&#x20;   classDef pattern fill:#FFF4E5,stroke:#ED7D31,color:#000;

&#x20;   classDef database fill:#F3E8FF,stroke:#8064A2,color:#000;



&#x20;   class U cliente;

&#x20;   class API,AUTH,ELEC,RES app;

&#x20;   class REPO,CACHE,CB,OBS,GRAPH pattern;

&#x20;   class PG,REDIS,MONGO,NEO database;

