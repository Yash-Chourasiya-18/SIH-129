"""
MOCK: Education Department System
Independent legacy system — returns a DIFFERENT JSON schema than Citizen Registry.
Note: student_id instead of citizen_id, percentage instead of marks, etc.
MH1003 has a name mismatch ("Amit D. Desai") to demo the mismatch detection feature.
"""
from typing import Optional

# Independent Education Department database
EDUCATION_DB: dict[str, dict] = {
    "MH1001": {
        "student_id": "MH1001",
        "student_name": "Rahul Sharma",           # matches citizen registry
        "institution_name": "ABC Engineering College, Pune",
        "course_name": "B.Tech Computer Engineering",
        "year_of_study": 2,
        "percentage": 82.4,
        "academic_year": "2025-26",
        "enrollment_no": "ABCE2024001",
        "status": "ACTIVE",
    },
    "MH1002": {
        "student_id": "MH1002",
        "student_name": "Priya Patil",
        "institution_name": "K.K. Wagh Institute of Engineering, Nashik",
        "course_name": "B.E. Electronics",
        "year_of_study": 3,
        "percentage": 78.1,
        "academic_year": "2025-26",
        "enrollment_no": "KKWE2023014",
        "status": "ACTIVE",
    },
    "MH1003": {
        "student_id": "MH1003",
        "student_name": "Amit D. Desai",          # intentional mismatch — triggers detection
        "institution_name": "Veermata Jijabai Technological Institute, Mumbai",
        "course_name": "B.Tech Mechanical",
        "year_of_study": 1,
        "percentage": 48.5,
        "academic_year": "2025-26",
        "enrollment_no": "VJTI2025003",
        "status": "ACTIVE",
    },
    "MH1004": {
        "student_id": "MH1004",
        "student_name": "Sneha Kulkarni",
        "institution_name": "Dr. Babasaheb Ambedkar Marathwada University, Aurangabad",
        "course_name": "B.Sc Information Technology",
        "year_of_study": 4,
        "percentage": 71.0,
        "academic_year": "2025-26",
        "enrollment_no": "BAMU2022007",
        "status": "ACTIVE",
    },
    "MH1005": {
        "student_id": "MH1005",
        "student_name": "Rohan Jadhav",
        "institution_name": "Shivaji University, Kolhapur",
        "course_name": "B.Tech Civil Engineering",
        "year_of_study": 2,
        "percentage": 88.3,
        "academic_year": "2025-26",
        "enrollment_no": "SUK2024005",
        "status": "ACTIVE",
    },
    "MH1006": {
        "student_id": "MH1006",
        "student_name": "Meera Joshi",
        "institution_name": "RCOEM, Nagpur",
        "course_name": "B.E. Computer Science",
        "year_of_study": 3,
        "percentage": 65.7,
        "academic_year": "2025-26",
        "enrollment_no": "RCOEM2023006",
        "status": "ACTIVE",
    },
    "MH1007": {
        "student_id": "MH1007",
        "student_name": "Kiran Shinde",
        "institution_name": "Walchand College of Engineering, Solapur",
        "course_name": "B.E. Electrical",
        "year_of_study": 2,
        "percentage": 55.2,
        "academic_year": "2025-26",
        "enrollment_no": "WCE2024007",
        "status": "ACTIVE",
    },
    "MH1008": {
        "student_id": "MH1008",
        "student_name": "Pooja Wagh",
        "institution_name": "Thane College of Engineering",
        "course_name": "B.Tech Chemical Engineering",
        "year_of_study": 1,
        "percentage": 74.6,
        "academic_year": "2025-26",
        "enrollment_no": "TCE2025008",
        "status": "ACTIVE",
    },
    "MH1009": {
        "student_id": "MH1009",
        "student_name": "Suresh Naik",
        "institution_name": "Ratnagiri Government Polytechnic",
        "course_name": "Diploma in Civil",
        "year_of_study": 3,
        "percentage": 60.0,
        "academic_year": "2025-26",
        "enrollment_no": "RGP2023009",
        "status": "ACTIVE",
    },
    "MH1010": {
        "student_id": "MH1010",
        "student_name": "Ananya More",
        "institution_name": "Symbiosis Institute of Technology, Pune",
        "course_name": "B.Tech Computer Science",
        "year_of_study": 2,
        "percentage": 72.3,
        "academic_year": "2025-26",
        "enrollment_no": "SIT2024010",
        "status": "ACTIVE",
    },
}


def get_education(citizen_id: str) -> Optional[dict]:
    """Return raw Education Department response — unique schema."""
    return EDUCATION_DB.get(citizen_id)
