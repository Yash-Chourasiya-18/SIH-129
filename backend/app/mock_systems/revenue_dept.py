"""
MOCK: Revenue Department System
Independent legacy system — deliberately different JSON schema.
Uses "id" instead of "citizen_id", "income_yearly" instead of "annual_income", etc.
"""
from typing import Optional

# Independent Revenue Department database
REVENUE_DB: dict[str, dict] = {
    "MH1001": {
        "id": "MH1001",
        "applicant_name": "Rahul Sharma",
        "income_yearly": 180000,
        "certificate_no": "INC9988",
        "issuing_tahsildar": "Tahsildar, Haveli",
        "certificate_date": "2025-04-01",
        "valid_till": "2026-03-31",
        "verified": True,
    },
    "MH1002": {
        "id": "MH1002",
        "applicant_name": "Priya Patil",
        "income_yearly": 320000,
        "certificate_no": "INC7761",
        "issuing_tahsildar": "Tahsildar, Nashik Road",
        "certificate_date": "2025-05-15",
        "valid_till": "2026-05-14",
        "verified": True,
    },
    "MH1003": {
        "id": "MH1003",
        "applicant_name": "Amit Desai",
        "income_yearly": 150000,
        "certificate_no": "INC4432",
        "issuing_tahsildar": "Tahsildar, Andheri",
        "certificate_date": "2025-03-20",
        "valid_till": "2026-03-19",
        "verified": True,
    },
    "MH1004": {
        "id": "MH1004",
        "applicant_name": "Sneha Kulkarni",
        "income_yearly": 210000,
        "certificate_no": "INC8823",
        "issuing_tahsildar": "Tahsildar, Aurangabad",
        "certificate_date": "2025-01-10",
        "valid_till": "2026-01-09",
        "verified": True,
    },
    "MH1005": {
        "id": "MH1005",
        "applicant_name": "Rohan Jadhav",
        "income_yearly": 90000,
        "certificate_no": "INC3315",
        "issuing_tahsildar": "Tahsildar, Karveer",
        "certificate_date": "2025-06-01",
        "valid_till": "2026-05-31",
        "verified": True,
    },
    "MH1006": {
        "id": "MH1006",
        "applicant_name": "Meera Joshi",
        "income_yearly": 195000,
        "certificate_no": "INC5564",
        "issuing_tahsildar": "Tahsildar, Nagpur City",
        "certificate_date": "2025-02-14",
        "valid_till": "2026-02-13",
        "verified": True,
    },
    "MH1007": {
        "id": "MH1007",
        "applicant_name": "Kiran Shinde",
        "income_yearly": 240000,
        "certificate_no": "INC6678",
        "issuing_tahsildar": "Tahsildar, Solapur North",
        "certificate_date": "2025-07-05",
        "valid_till": "2026-07-04",
        "verified": True,
    },
    "MH1008": {
        "id": "MH1008",
        "applicant_name": "Pooja Wagh",
        "income_yearly": 120000,
        "certificate_no": "INC2247",
        "issuing_tahsildar": "Tahsildar, Thane",
        "certificate_date": "2025-04-22",
        "valid_till": "2026-04-21",
        "verified": True,
    },
    "MH1009": {
        "id": "MH1009",
        "applicant_name": "Suresh Naik",
        "income_yearly": 180000,
        "certificate_no": "INC9901",
        "issuing_tahsildar": "Tahsildar, Chiplun",
        "certificate_date": "2025-03-10",
        "valid_till": "2026-03-09",
        "verified": True,
    },
    "MH1010": {
        "id": "MH1010",
        "applicant_name": "Ananya More",
        "income_yearly": 200000,
        "certificate_no": "INC1183",
        "issuing_tahsildar": "Tahsildar, Mulshi",
        "certificate_date": "2025-08-01",
        "valid_till": "2026-07-31",
        "verified": True,
    },
}


def get_revenue(citizen_id: str) -> Optional[dict]:
    """Return raw Revenue Department response — unique schema (id, income_yearly, certificate_no)."""
    return REVENUE_DB.get(citizen_id)
