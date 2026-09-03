"""
MOCK: Welfare Department System
Independent legacy system — deliberately different JSON schema.
Uses "beneficiary_id", "scheme_name", "already_received" (boolean), etc.
"""
from typing import Optional

# Independent Welfare Department database
WELFARE_DB: dict[str, dict] = {
    "MH1001": {
        "beneficiary_id": "MH1001",
        "registered_name": "Rahul Sharma",
        "scheme_name": "Student Scholarship",
        "scheme_code": "MAHA-SCH-2026",
        "already_received": False,
        "category": "OBC",
        "welfare_card_no": "WC-PNE-001",
        "registration_status": "ACTIVE",
    },
    "MH1002": {
        "beneficiary_id": "MH1002",
        "registered_name": "Priya Patil",
        "scheme_name": "Student Scholarship",
        "scheme_code": "MAHA-SCH-2026",
        "already_received": False,
        "category": "OPEN",
        "welfare_card_no": "WC-NSK-002",
        "registration_status": "ACTIVE",
    },
    "MH1003": {
        "beneficiary_id": "MH1003",
        "registered_name": "Amit Desai",
        "scheme_name": "Student Scholarship",
        "scheme_code": "MAHA-SCH-2026",
        "already_received": False,
        "category": "OPEN",
        "welfare_card_no": "WC-MUM-003",
        "registration_status": "ACTIVE",
    },
    "MH1004": {
        "beneficiary_id": "MH1004",
        "registered_name": "Sneha Kulkarni",
        "scheme_name": "Student Scholarship",
        "scheme_code": "MAHA-SCH-2026",
        "already_received": True,       # already received — ineligible
        "category": "SC",
        "welfare_card_no": "WC-AUR-004",
        "registration_status": "ACTIVE",
    },
    "MH1005": {
        "beneficiary_id": "MH1005",
        "registered_name": "Rohan Jadhav",
        "scheme_name": "Student Scholarship",
        "scheme_code": "MAHA-SCH-2026",
        "already_received": False,
        "category": "OBC",
        "welfare_card_no": "WC-KLP-005",
        "registration_status": "ACTIVE",
    },
    "MH1006": {
        "beneficiary_id": "MH1006",
        "registered_name": "Meera Joshi",
        "scheme_name": "Student Scholarship",
        "scheme_code": "MAHA-SCH-2026",
        "already_received": False,
        "category": "NT",
        "welfare_card_no": "WC-NGP-006",
        "registration_status": "ACTIVE",
    },
    "MH1007": {
        "beneficiary_id": "MH1007",
        "registered_name": "Kiran Shinde",
        "scheme_name": "Student Scholarship",
        "scheme_code": "MAHA-SCH-2026",
        "already_received": False,
        "category": "OPEN",
        "welfare_card_no": "WC-SLP-007",
        "registration_status": "ACTIVE",
    },
    "MH1008": {
        "beneficiary_id": "MH1008",
        "registered_name": "Pooja Wagh",
        "scheme_name": "Student Scholarship",
        "scheme_code": "MAHA-SCH-2026",
        "already_received": False,
        "category": "SC",
        "welfare_card_no": "WC-THN-008",
        "registration_status": "ACTIVE",
    },
    "MH1009": {
        "beneficiary_id": "MH1009",
        "registered_name": "Suresh Naik",
        "scheme_name": "Student Scholarship",
        "scheme_code": "MAHA-SCH-2026",
        "already_received": False,
        "category": "ST",
        "welfare_card_no": "WC-RTN-009",
        "registration_status": "ACTIVE",
    },
    "MH1010": {
        "beneficiary_id": "MH1010",
        "registered_name": "Ananya More",
        "scheme_name": "Student Scholarship",
        "scheme_code": "MAHA-SCH-2026",
        "already_received": False,
        "category": "OBC",
        "welfare_card_no": "WC-PNE-010",
        "registration_status": "ACTIVE",
    },
}


def get_welfare(citizen_id: str) -> Optional[dict]:
    """Return raw Welfare Department response — unique schema (beneficiary_id, already_received)."""
    return WELFARE_DB.get(citizen_id)
