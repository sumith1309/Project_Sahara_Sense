import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))


def test_health_check():
    """Test basic health endpoint"""
    from fastapi.testclient import TestClient
    from app.main import app
    
    client = TestClient(app)
    response = client.get("/health")
    
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_root():
    """Test root endpoint"""
    from fastapi.testclient import TestClient
    from app.main import app
    
    client = TestClient(app)
    response = client.get("/")
    
    assert response.status_code == 200
    assert response.json()["name"] == "HABOOB.ai"
    assert response.json()["version"] == "5.0.0"


def test_accuracy_endpoint():
    """Test accuracy endpoint"""
    from fastapi.testclient import TestClient
    from app.main import app
    
    client = TestClient(app)
    response = client.get("/api/v1/accuracy/overall")
    
    assert response.status_code == 200
    assert "overall_accuracy" in response.json()


def test_data_quality_endpoint():
    """Test data quality endpoint"""
    from fastapi.testclient import TestClient
    from app.main import app
    
    client = TestClient(app)
    response = client.get("/api/v1/accuracy/data-quality")
    
    assert response.status_code == 200
    assert "valid_ranges" in response.json()


def test_health_detailed():
    """Test detailed health endpoint"""
    from fastapi.testclient import TestClient
    from app.main import app
    
    client = TestClient(app)
    response = client.get("/api/v1/health/detailed")
    
    assert response.status_code == 200
    assert "checks" in response.json()


def test_health_metrics():
    """Test metrics endpoint"""
    from fastapi.testclient import TestClient
    from app.main import app
    
    client = TestClient(app)
    response = client.get("/api/v1/health/metrics")
    
    assert response.status_code == 200
    assert "haboob_accuracy_percent" in response.text
