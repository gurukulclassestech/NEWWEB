#!/usr/bin/env python3
"""
Backend API Test Suite for Gurukul Classes
Tests all backend endpoints at REACT_APP_BACKEND_URL/api
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Local backend URL for a clean self-hosted setup
BASE_URL = "http://localhost:8000/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

class TestRunner:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.test_data = {}  # Store created items for cleanup
        
    def log(self, message: str, color: str = Colors.RESET):
        print(f"{color}{message}{Colors.RESET}")
    
    def test(self, name: str, condition: bool, details: str = ""):
        if condition:
            self.passed += 1
            self.log(f"✅ PASS: {name}", Colors.GREEN)
            if details:
                self.log(f"   {details}", Colors.BLUE)
        else:
            self.failed += 1
            self.log(f"❌ FAIL: {name}", Colors.RED)
            if details:
                self.log(f"   {details}", Colors.YELLOW)
    
    def summary(self):
        total = self.passed + self.failed
        self.log(f"\n{'='*60}", Colors.BLUE)
        self.log(f"TEST SUMMARY: {self.passed}/{total} passed", Colors.BLUE)
        self.log(f"{'='*60}\n", Colors.BLUE)
        return self.failed == 0

def test_health(runner: TestRunner):
    """Test 1: Health & Seed"""
    runner.log("\n=== TEST 1: Health & Seed ===", Colors.BLUE)
    
    # Test health endpoint
    try:
        resp = requests.get(f"{BASE_URL}/")
        runner.test(
            "GET /api/ returns 200",
            resp.status_code == 200,
            f"Status: {resp.status_code}"
        )
        
        data = resp.json()
        runner.test(
            "GET /api/ returns correct message",
            data.get("message") == "Gurukul Classes API",
            f"Response: {data}"
        )
    except Exception as e:
        runner.test("GET /api/ health check", False, f"Error: {str(e)}")
    
    # Test seed endpoint - first call
    try:
        resp = requests.post(f"{BASE_URL}/seed")
        runner.test(
            "POST /api/seed returns 200",
            resp.status_code == 200,
            f"Status: {resp.status_code}"
        )
        
        data = resp.json()
        first_counts = data.get("counts", {})
        runner.test(
            "POST /api/seed returns seeded=True",
            data.get("seeded") == True,
            f"Response: {data}"
        )
        
        runner.test(
            "POST /api/seed creates 6 courses",
            first_counts.get("courses") == 6,
            f"Courses count: {first_counts.get('courses')}"
        )
        
        # Test seed idempotency - second call
        resp2 = requests.post(f"{BASE_URL}/seed")
        data2 = resp2.json()
        second_counts = data2.get("counts", {})
        
        runner.test(
            "POST /api/seed is idempotent (courses count unchanged)",
            second_counts.get("courses") == first_counts.get("courses"),
            f"First: {first_counts.get('courses')}, Second: {second_counts.get('courses')}"
        )
        
        runner.test(
            "POST /api/seed is idempotent (faculty count unchanged)",
            second_counts.get("faculty") == first_counts.get("faculty"),
            f"First: {first_counts.get('faculty')}, Second: {second_counts.get('faculty')}"
        )
        
    except Exception as e:
        runner.test("POST /api/seed", False, f"Error: {str(e)}")

def test_content_crud(runner: TestRunner):
    """Test 2: Content CRUD round-trip on courses"""
    runner.log("\n=== TEST 2: Content CRUD (Courses) ===", Colors.BLUE)
    
    created_course_id = None
    
    # GET list
    try:
        resp = requests.get(f"{BASE_URL}/courses")
        runner.test(
            "GET /api/courses returns 200",
            resp.status_code == 200,
            f"Status: {resp.status_code}"
        )
        
        courses = resp.json()
        runner.test(
            "GET /api/courses returns list",
            isinstance(courses, list),
            f"Type: {type(courses)}"
        )
        
        runner.test(
            "GET /api/courses has 6 items after seed",
            len(courses) >= 6,
            f"Count: {len(courses)}"
        )
    except Exception as e:
        runner.test("GET /api/courses", False, f"Error: {str(e)}")
    
    # POST create
    try:
        new_course = {
            "slug": "test-course-backend",
            "title": "Test Course for Backend Testing",
            "duration": "6 Months",
            "audience": "Test Students",
            "price": "₹50,000",
            "image": "https://images.unsplash.com/photo-1581726707445-75cbe4efc586?auto=format&fit=crop&w=1200&q=80",
            "short": "This is a test course created by backend_test.py",
            "detail": "Detailed description of the test course for comprehensive backend API testing.",
            "highlights": ["Test Feature 1", "Test Feature 2", "Test Feature 3"],
            "subjects": ["Test Subject 1", "Test Subject 2"]
        }
        
        resp = requests.post(f"{BASE_URL}/courses", json=new_course)
        runner.test(
            "POST /api/courses returns 200",
            resp.status_code == 200,
            f"Status: {resp.status_code}"
        )
        
        created = resp.json()
        created_course_id = created.get("id")
        
        runner.test(
            "POST /api/courses returns created object with id",
            created_course_id is not None,
            f"ID: {created_course_id}"
        )
        
        runner.test(
            "POST /api/courses preserves slug",
            created.get("slug") == new_course["slug"],
            f"Slug: {created.get('slug')}"
        )
        
        runner.test(
            "POST /api/courses preserves title",
            created.get("title") == new_course["title"],
            f"Title: {created.get('title')}"
        )
        
        runner.test(
            "POST /api/courses includes created_at",
            "created_at" in created,
            f"Has created_at: {'created_at' in created}"
        )
        
        runner.test_data["course_id"] = created_course_id
        runner.test_data["course_slug"] = new_course["slug"]
        
    except Exception as e:
        runner.test("POST /api/courses", False, f"Error: {str(e)}")
    
    # GET by slug
    if created_course_id:
        try:
            resp = requests.get(f"{BASE_URL}/courses/slug/{runner.test_data['course_slug']}")
            runner.test(
                "GET /api/courses/slug/{slug} returns 200",
                resp.status_code == 200,
                f"Status: {resp.status_code}"
            )
            
            course = resp.json()
            runner.test(
                "GET /api/courses/slug/{slug} returns correct course",
                course.get("id") == created_course_id,
                f"ID matches: {course.get('id') == created_course_id}"
            )
        except Exception as e:
            runner.test("GET /api/courses/slug/{slug}", False, f"Error: {str(e)}")
    
    # PUT update
    if created_course_id:
        try:
            updated_course = {
                "slug": "test-course-backend",
                "title": "Test Course for Backend Testing - UPDATED",
                "duration": "6 Months",
                "audience": "Test Students",
                "price": "₹75,000",  # Updated price
                "image": "https://images.unsplash.com/photo-1581726707445-75cbe4efc586?auto=format&fit=crop&w=1200&q=80",
                "short": "This is a test course created by backend_test.py",
                "detail": "Detailed description of the test course for comprehensive backend API testing.",
                "highlights": ["Test Feature 1", "Test Feature 2", "Test Feature 3"],
                "subjects": ["Test Subject 1", "Test Subject 2"]
            }
            
            resp = requests.put(f"{BASE_URL}/courses/{created_course_id}", json=updated_course)
            runner.test(
                "PUT /api/courses/{id} returns 200",
                resp.status_code == 200,
                f"Status: {resp.status_code}"
            )
            
            updated = resp.json()
            runner.test(
                "PUT /api/courses/{id} updates price",
                updated.get("price") == "₹75,000",
                f"Price: {updated.get('price')}"
            )
        except Exception as e:
            runner.test("PUT /api/courses/{id}", False, f"Error: {str(e)}")
    
    # DELETE
    if created_course_id:
        try:
            resp = requests.delete(f"{BASE_URL}/courses/{created_course_id}")
            runner.test(
                "DELETE /api/courses/{id} returns 200",
                resp.status_code == 200,
                f"Status: {resp.status_code}"
            )
            
            # Verify deletion
            resp_get = requests.get(f"{BASE_URL}/courses/slug/{runner.test_data['course_slug']}")
            runner.test(
                "GET /api/courses/slug/{slug} returns 404 after delete",
                resp_get.status_code == 404,
                f"Status: {resp_get.status_code}"
            )
        except Exception as e:
            runner.test("DELETE /api/courses/{id}", False, f"Error: {str(e)}")

def test_content_list_endpoints(runner: TestRunner):
    """Test 2b: Smoke test list endpoints for other content types"""
    runner.log("\n=== TEST 2b: Content List Endpoints (Smoke Test) ===", Colors.BLUE)
    
    endpoints = ["faculty", "blogs", "testimonials", "toppers", "results", "gallery", "news"]
    
    for endpoint in endpoints:
        try:
            resp = requests.get(f"{BASE_URL}/{endpoint}")
            runner.test(
                f"GET /api/{endpoint} returns 200",
                resp.status_code == 200,
                f"Status: {resp.status_code}"
            )
            
            data = resp.json()
            runner.test(
                f"GET /api/{endpoint} returns list",
                isinstance(data, list),
                f"Type: {type(data)}, Count: {len(data)}"
            )
        except Exception as e:
            runner.test(f"GET /api/{endpoint}", False, f"Error: {str(e)}")

def test_lead_flow(runner: TestRunner):
    """Test 3: Lead flow on inquiries"""
    runner.log("\n=== TEST 3: Lead Flow (Inquiries) ===", Colors.BLUE)
    
    created_inquiry_id = None
    
    # POST create inquiry
    try:
        new_inquiry = {
            "name": "Rahul Sharma",
            "phone": "9876543210",
            "email": "rahul.sharma@example.com",
            "city": "Mumbai",
            "course": "JEE (Mains + Advanced)",
            "message": "I am interested in joining the 2-year JEE program. Please provide more details."
        }
        
        resp = requests.post(f"{BASE_URL}/inquiries", json=new_inquiry)
        runner.test(
            "POST /api/inquiries returns 200",
            resp.status_code == 200,
            f"Status: {resp.status_code}"
        )
        
        created = resp.json()
        created_inquiry_id = created.get("id")
        
        runner.test(
            "POST /api/inquiries returns created object with id",
            created_inquiry_id is not None,
            f"ID: {created_inquiry_id}"
        )
        
        runner.test(
            "POST /api/inquiries sets status='new'",
            created.get("status") == "new",
            f"Status: {created.get('status')}"
        )
        
        runner.test(
            "POST /api/inquiries preserves name",
            created.get("name") == new_inquiry["name"],
            f"Name: {created.get('name')}"
        )
        
        runner.test_data["inquiry_id"] = created_inquiry_id
        
    except Exception as e:
        runner.test("POST /api/inquiries", False, f"Error: {str(e)}")
    
    # GET list
    try:
        resp = requests.get(f"{BASE_URL}/inquiries")
        runner.test(
            "GET /api/inquiries returns 200",
            resp.status_code == 200,
            f"Status: {resp.status_code}"
        )
        
        inquiries = resp.json()
        runner.test(
            "GET /api/inquiries returns list",
            isinstance(inquiries, list),
            f"Type: {type(inquiries)}, Count: {len(inquiries)}"
        )
        
        if created_inquiry_id:
            found = any(inq.get("id") == created_inquiry_id for inq in inquiries)
            runner.test(
                "GET /api/inquiries includes created inquiry",
                found,
                f"Found: {found}"
            )
    except Exception as e:
        runner.test("GET /api/inquiries", False, f"Error: {str(e)}")
    
    # GET with status filter
    try:
        resp = requests.get(f"{BASE_URL}/inquiries?status=new")
        runner.test(
            "GET /api/inquiries?status=new returns 200",
            resp.status_code == 200,
            f"Status: {resp.status_code}"
        )
        
        inquiries = resp.json()
        runner.test(
            "GET /api/inquiries?status=new returns list",
            isinstance(inquiries, list),
            f"Count: {len(inquiries)}"
        )
        
        # Verify all have status='new'
        all_new = all(inq.get("status") == "new" for inq in inquiries)
        runner.test(
            "GET /api/inquiries?status=new filters correctly",
            all_new,
            f"All have status='new': {all_new}"
        )
    except Exception as e:
        runner.test("GET /api/inquiries?status=new", False, f"Error: {str(e)}")
    
    # PATCH update status
    if created_inquiry_id:
        try:
            resp = requests.patch(
                f"{BASE_URL}/inquiries/{created_inquiry_id}",
                json={"status": "contacted"}
            )
            runner.test(
                "PATCH /api/inquiries/{id} returns 200",
                resp.status_code == 200,
                f"Status: {resp.status_code}"
            )
            
            updated = resp.json()
            runner.test(
                "PATCH /api/inquiries/{id} updates status",
                updated.get("status") == "contacted",
                f"Status: {updated.get('status')}"
            )
        except Exception as e:
            runner.test("PATCH /api/inquiries/{id}", False, f"Error: {str(e)}")
    
    # GET CSV export
    try:
        resp = requests.get(f"{BASE_URL}/inquiries/export.csv")
        runner.test(
            "GET /api/inquiries/export.csv returns 200",
            resp.status_code == 200,
            f"Status: {resp.status_code}"
        )
        
        runner.test(
            "GET /api/inquiries/export.csv returns text/csv",
            "text/csv" in resp.headers.get("content-type", ""),
            f"Content-Type: {resp.headers.get('content-type')}"
        )
        
        csv_content = resp.text
        runner.test(
            "GET /api/inquiries/export.csv has header row",
            "id" in csv_content.lower() or "name" in csv_content.lower(),
            f"First 100 chars: {csv_content[:100]}"
        )
    except Exception as e:
        runner.test("GET /api/inquiries/export.csv", False, f"Error: {str(e)}")
    
    # DELETE
    if created_inquiry_id:
        try:
            resp = requests.delete(f"{BASE_URL}/inquiries/{created_inquiry_id}")
            runner.test(
                "DELETE /api/inquiries/{id} returns 200",
                resp.status_code == 200,
                f"Status: {resp.status_code}"
            )
        except Exception as e:
            runner.test("DELETE /api/inquiries/{id}", False, f"Error: {str(e)}")

def test_lead_smoke(runner: TestRunner):
    """Test 3b: Smoke test other lead endpoints"""
    runner.log("\n=== TEST 3b: Lead Endpoints (Smoke Test) ===", Colors.BLUE)
    
    endpoints = ["admissions", "scholarship", "careers"]
    
    for endpoint in endpoints:
        try:
            resp = requests.get(f"{BASE_URL}/{endpoint}")
            runner.test(
                f"GET /api/{endpoint} returns 200",
                resp.status_code == 200,
                f"Status: {resp.status_code}"
            )
            
            data = resp.json()
            runner.test(
                f"GET /api/{endpoint} returns list",
                isinstance(data, list),
                f"Type: {type(data)}, Count: {len(data)}"
            )
        except Exception as e:
            runner.test(f"GET /api/{endpoint}", False, f"Error: {str(e)}")

def test_dashboard(runner: TestRunner):
    """Test 4: Dashboard stats"""
    runner.log("\n=== TEST 4: Dashboard Stats ===", Colors.BLUE)
    
    try:
        resp = requests.get(f"{BASE_URL}/dashboard/stats")
        runner.test(
            "GET /api/dashboard/stats returns 200",
            resp.status_code == 200,
            f"Status: {resp.status_code}"
        )
        
        stats = resp.json()
        
        # Check for required keys
        required_keys = [
            "inquiries", "inquiries_new",
            "admissions", "admissions_new",
            "scholarship", "scholarship_new",
            "careers", "careers_new",
            "courses", "faculty", "blogs", "testimonials",
            "toppers", "gallery", "news", "results"
        ]
        
        for key in required_keys:
            runner.test(
                f"GET /api/dashboard/stats includes '{key}'",
                key in stats,
                f"Value: {stats.get(key)}"
            )
        
        # Verify counts are numbers
        runner.test(
            "GET /api/dashboard/stats returns numeric counts",
            all(isinstance(v, int) for v in stats.values()),
            f"All values are integers: {all(isinstance(v, int) for v in stats.values())}"
        )
        
        # Verify courses count is 6 (from seed)
        runner.test(
            "GET /api/dashboard/stats shows 6 courses",
            stats.get("courses") == 6,
            f"Courses: {stats.get('courses')}"
        )
        
    except Exception as e:
        runner.test("GET /api/dashboard/stats", False, f"Error: {str(e)}")

def test_blog_by_slug(runner: TestRunner):
    """Test 5: Blog by slug"""
    runner.log("\n=== TEST 5: Blog by Slug ===", Colors.BLUE)
    
    created_blog_id = None
    test_slug = "test-blog-backend-api"
    
    # POST create blog
    try:
        new_blog = {
            "slug": test_slug,
            "title": "Test Blog for Backend API Testing",
            "excerpt": "This is a test blog post created by backend_test.py for comprehensive API testing.",
            "author": "Test Author",
            "category": "Testing",
            "cover": "https://images.unsplash.com/photo-1581726707445-75cbe4efc586?auto=format&fit=crop&w=1200&q=80",
            "body": "This is the full body content of the test blog post. It contains detailed information for testing purposes.",
            "date": "15 Jan 2026"
        }
        
        resp = requests.post(f"{BASE_URL}/blogs", json=new_blog)
        runner.test(
            "POST /api/blogs returns 200",
            resp.status_code == 200,
            f"Status: {resp.status_code}"
        )
        
        created = resp.json()
        created_blog_id = created.get("id")
        
        runner.test(
            "POST /api/blogs returns created object with id",
            created_blog_id is not None,
            f"ID: {created_blog_id}"
        )
        
        runner.test_data["blog_id"] = created_blog_id
        runner.test_data["blog_slug"] = test_slug
        
    except Exception as e:
        runner.test("POST /api/blogs", False, f"Error: {str(e)}")
    
    # GET by slug
    if created_blog_id:
        try:
            resp = requests.get(f"{BASE_URL}/blogs/slug/{test_slug}")
            runner.test(
                "GET /api/blogs/slug/{slug} returns 200",
                resp.status_code == 200,
                f"Status: {resp.status_code}"
            )
            
            blog = resp.json()
            runner.test(
                "GET /api/blogs/slug/{slug} returns correct blog",
                blog.get("id") == created_blog_id,
                f"ID matches: {blog.get('id') == created_blog_id}"
            )
            
            runner.test(
                "GET /api/blogs/slug/{slug} returns correct title",
                blog.get("title") == "Test Blog for Backend API Testing",
                f"Title: {blog.get('title')}"
            )
        except Exception as e:
            runner.test("GET /api/blogs/slug/{slug}", False, f"Error: {str(e)}")
    
    # PUT update
    if created_blog_id:
        try:
            updated_blog = {
                "slug": test_slug,
                "title": "Test Blog for Backend API Testing - UPDATED",
                "excerpt": "This is a test blog post created by backend_test.py for comprehensive API testing.",
                "author": "Test Author Updated",
                "category": "Testing",
                "cover": "https://images.unsplash.com/photo-1581726707445-75cbe4efc586?auto=format&fit=crop&w=1200&q=80",
                "body": "This is the UPDATED full body content of the test blog post.",
                "date": "15 Jan 2026"
            }
            
            resp = requests.put(f"{BASE_URL}/blogs/{created_blog_id}", json=updated_blog)
            runner.test(
                "PUT /api/blogs/{id} returns 200",
                resp.status_code == 200,
                f"Status: {resp.status_code}"
            )
            
            updated = resp.json()
            runner.test(
                "PUT /api/blogs/{id} updates author",
                updated.get("author") == "Test Author Updated",
                f"Author: {updated.get('author')}"
            )
        except Exception as e:
            runner.test("PUT /api/blogs/{id}", False, f"Error: {str(e)}")
    
    # DELETE
    if created_blog_id:
        try:
            resp = requests.delete(f"{BASE_URL}/blogs/{created_blog_id}")
            runner.test(
                "DELETE /api/blogs/{id} returns 200",
                resp.status_code == 200,
                f"Status: {resp.status_code}"
            )
            
            # Verify deletion
            resp_get = requests.get(f"{BASE_URL}/blogs/slug/{test_slug}")
            runner.test(
                "GET /api/blogs/slug/{slug} returns 404 after delete",
                resp_get.status_code == 404,
                f"Status: {resp_get.status_code}"
            )
        except Exception as e:
            runner.test("DELETE /api/blogs/{id}", False, f"Error: {str(e)}")

def main():
    runner = TestRunner()
    
    runner.log("\n" + "="*60, Colors.BLUE)
    runner.log("Gurukul Classes Backend API Test Suite", Colors.BLUE)
    runner.log(f"Testing: {BASE_URL}", Colors.BLUE)
    runner.log("="*60 + "\n", Colors.BLUE)
    
    # Run tests in priority order
    test_health(runner)
    test_content_crud(runner)
    test_content_list_endpoints(runner)
    test_lead_flow(runner)
    test_lead_smoke(runner)
    test_dashboard(runner)
    test_blog_by_slug(runner)
    
    # Print summary
    success = runner.summary()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
