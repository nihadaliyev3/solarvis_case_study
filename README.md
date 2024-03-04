## SolarVis Case Study

Dashboard for User Item Management of an Organization

## Getting Started

### Prerequisites

* Python 3.11.6
* npm@10.4.0
* PostgreSql 15

### Installation

**1. Backend**

```bash
git clone [your-github-repo-url]
cd your-repo
pip install -r requirements.txt
```

**2. Database**
* Create a database for your project.
* Update the database connection URL in the db_connections.py file.

**3.  Environment Variables (.env file)**
*Create .env file in backend folder
```bash
SECRET_KEY=your_long_and_secure_secret_key   
ALGORITHM=your_algorithm
ACCESS_TOKEN_EXPIRE_MINUTES=your_expire_time_in_minutes
```
**4. Run Backend**
```bash
cd backend
uvicorn main:app --reload
```

**5. Build and Run Frontend**
```bash
cd frontend
npm install
npm start
```
