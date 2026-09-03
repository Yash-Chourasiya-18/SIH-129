"""
MOCK: Citizen Registry System
Independent legacy system — returns its own JSON schema.
MahaSetu's normalizer transforms this into the common internal model.
"""
from typing import Optional

# In-memory mock database — simulates a legacy citizen registry
CITIZEN_DB: dict[str, dict] = {
    "MH1001": {
        "citizen_id": "MH1001",
        "full_name": "Rahul Sharma",
        "district_name": "Pune",
        "taluka": "Haveli",
        "date_of_birth": "2003-05-14",
        "gender": "Male",
        "aadhaar_linked": True,
        "mobile_verified": True,
        "registration_date": "2020-01-10",
    },
    "MH1002": {
        "citizen_id": "MH1002",
        "full_name": "Priya Patil",
        "district_name": "Nashik",
        "taluka": "Nashik Road",
        "date_of_birth": "2002-11-22",
        "gender": "Female",
        "aadhaar_linked": True,
        "mobile_verified": True,
        "registration_date": "2019-06-15",
    },
    "MH1003": {
        "citizen_id": "MH1003",
        "full_name": "Amit Desai",
        "district_name": "Mumbai",
        "taluka": "Andheri",
        "date_of_birth": "2004-02-08",
        "gender": "Male",
        "aadhaar_linked": True,
        "mobile_verified": False,
        "registration_date": "2021-03-22",
    },
    "MH1004": {
        "citizen_id": "MH1004",
        "full_name": "Sneha Kulkarni",
        "district_name": "Aurangabad",
        "taluka": "Aurangabad",
        "date_of_birth": "2001-08-17",
        "gender": "Female",
        "aadhaar_linked": True,
        "mobile_verified": True,
        "registration_date": "2018-09-05",
    },
    "MH1005": {
        "citizen_id": "MH1005",
        "full_name": "Rohan Jadhav",
        "district_name": "Kolhapur",
        "taluka": "Karveer",
        "date_of_birth": "2003-12-01",
        "gender": "Male",
        "aadhaar_linked": True,
        "mobile_verified": True,
        "registration_date": "2020-07-11",
    },
    "MH1006": {
        "citizen_id": "MH1006",
        "full_name": "Meera Joshi",
        "district_name": "Nagpur",
        "taluka": "Nagpur City",
        "date_of_birth": "2002-04-30",
        "gender": "Female",
        "aadhaar_linked": True,
        "mobile_verified": True,
        "registration_date": "2019-11-20",
    },
    "MH1007": {
        "citizen_id": "MH1007",
        "full_name": "Kiran Shinde",
        "district_name": "Solapur",
        "taluka": "Solapur North",
        "date_of_birth": "2003-07-19",
        "gender": "Male",
        "aadhaar_linked": False,
        "mobile_verified": True,
        "registration_date": "2021-08-14",
    },
    "MH1008": {
        "citizen_id": "MH1008",
        "full_name": "Pooja Wagh",
        "district_name": "Thane",
        "taluka": "Thane",
        "date_of_birth": "2004-01-25",
        "gender": "Female",
        "aadhaar_linked": True,
        "mobile_verified": True,
        "registration_date": "2022-01-30",
    },
    "MH1009": {
        "citizen_id": "MH1009",
        "full_name": "Suresh Naik",
        "district_name": "Ratnagiri",
        "taluka": "Chiplun",
        "date_of_birth": "2002-09-10",
        "gender": "Male",
        "aadhaar_linked": True,
        "mobile_verified": True,
        "registration_date": "2019-04-17",
    },
    "MH1010": {
        "citizen_id": "MH1010",
        "full_name": "Ananya More",
        "district_name": "Pune",
        "taluka": "Mulshi",
        "date_of_birth": "2003-03-07",
        "gender": "Female",
        "aadhaar_linked": True,
        "mobile_verified": True,
        "registration_date": "2021-02-28",
    },
}


def get_citizen(citizen_id: str) -> Optional[dict]:
    """Return raw Citizen Registry response — unique schema."""
    return CITIZEN_DB.get(citizen_id)
