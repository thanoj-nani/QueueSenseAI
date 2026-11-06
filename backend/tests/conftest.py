import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.database import Base, get_db
from backend.app.main import app, seed_initial_data
from backend.app.routers.auth import create_access_token

TEST_DATABASE_PATH = "./test_queuesense.db"
TEST_DATABASE_URL = f"sqlite:///{TEST_DATABASE_PATH}"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists(TEST_DATABASE_PATH):
        try:
            os.remove(TEST_DATABASE_PATH)
        except Exception:
            pass

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def admin_headers():
    token = create_access_token(data={"sub": "admin@queuesense.ai", "role": "admin", "id": 1})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def user_headers():
    token = create_access_token(data={"sub": "user@queuesense.ai", "role": "user", "id": 2})
    return {"Authorization": f"Bearer {token}"}
