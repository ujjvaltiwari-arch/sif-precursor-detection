"""Generate synthetic safety report dataset for demo/testing."""

import csv
import json
import random
from datetime import date, timedelta
from pathlib import Path

# --- Taxonomy ---
SITES = [
    {"name": "Dibrugarh Terminal", "code": "DIB", "lat": 27.47, "lng": 94.91},
    {"name": "Jorhat Pump Station", "code": "JOR", "lat": 26.75, "lng": 94.20},
    {"name": "Nazira Oil Field", "code": "NAZ", "lat": 26.92, "lng": 94.78},
    {"name": "Selenghat Station", "code": "SEL", "lat": 26.85, "lng": 94.52},
    {"name": "Margherita Depot", "code": "MRG", "lat": 27.28, "lng": 95.67},
]

DEPARTMENTS = [
    "Drilling", "Production", "Maintenance", "HSE", "Pipeline",
    "Well Services", "Engineering", "Logistics",
]

WORK_TYPES = [
    "drilling", "welding", "lifting", "electrical work", "pipeline repair",
    "confined space entry", "working at height", "excavation",
    "turnaround maintenance", "well testing",
]

# --- Templates per risk level ---
HIGH_RISK_TEMPLATES = [
    "Worker entered confined space without proper gas testing and without isolation. No permit to work was obtained. The space had not been ventilated and no rescue equipment was on standby.",
    "Driller climbed derrick without fall arrest harness. Safety line was frayed and not inspected. Worker was at 15 meters height during strong wind conditions.",
    "Electrician performed live electrical work on 11kV panel without LOTO. Panel was not de-energized and no arc flash PPE was worn. Other workers were within 3 meters.",
    "Foreman ordered crane lift over personnel without designated signalman. Load was 2 tons above rated capacity. Outrigger pads were not placed on stable ground.",
    "Worker used damaged gas cylinder without pressure testing. Cylinder was last tested 3 years ago. Valve was leaking and worker was smoking nearby.",
    "Pipeline welder worked on live pipeline without isolating flow. No hot work permit was obtained. Fire extinguisher was 50 meters away and empty.",
    "Technician entered pump station without gas monitoring. H2S alarm was disabled for maintenance. No standby person was present outside the confined space.",
    "Rigger attached sling to unsecured load on elevated platform. No tagline was used. Wind speed exceeded crane operation limits.",
    "Worker cleaned chemical tank without removing residual chemicals. No respiratory protection was worn. Ventilation fan was not functioning.",
    "Drill crew conducted perforation operations without evacuating nearby workforce. Blast zone was not secured. Warning signals were not tested.",
    "Electrician bypassed safety interlock on motor control center. Lockout devices were removed without authorization. Start-up warning was not sounded.",
    "Worker performed hot work on fuel storage tank without gas-free certificate. Flammable vapors were detected 2 hours before work started.",
    "Crane operator lifted personnel in unauthorized basket. Basket was not inspected and had no fall protection. Load path crossed over active roadway.",
    "Worker climbed storage tank without secured ladder. Handrails were missing on upper platform. No safety harness was available on site.",
    "Technician repaired high-pressure valve without depressurizing line. Safety valve was isolated and no bypass procedure was followed.",
]

MEDIUM_RISK_TEMPLATES = [
    "Worker forgot to wear safety glasses while chipping near rotating equipment. Chip guard was not in place. Supervisor observed from 10 meters away.",
    "Scaffolding was erected without final inspection tag. Worker accessed scaffold before green tag was applied. Toe boards were missing on one side.",
    "Forklift was operated with cracked windshield. Operator did not wear seatbelt. Speed limit in warehouse area was exceeded by 5 km/h.",
    "Worker performed grinding without face shield. sparks were directed toward flammable material storage area 3 meters away.",
    "Pipeline crew dug excavation near buried cable without calling utility locating service. Warning tape was found 0.5 meters from dig point.",
    "Welder used damaged electrode holder. Insulation was cracked and exposed live parts. Earth lead was corroded and loosely connected.",
    "Worker entered restricted area without authorization badge. Access control gate was propped open. Security camera was not operational.",
    "Crane was operated with 15 percent load capacity margin exceeded for brief period. Operator corrected immediately after warning from signalman.",
    "Worker used compressed air to clean clothing instead of proper cleaning method. Air pressure exceeded 30 PSI limit for cleaning.",
    "Electrical panel door was left open after maintenance. Warning labels were faded and not replaced. No temporary barrier was installed.",
    "Worker climbed ladder without maintaining three-point contact. Ladder was not secured at top. Safety boots had worn-out soles.",
    "Mobile equipment reversed without spotter in congested area. Backup alarm was intermittent. Mirror coverage was incomplete.",
    "Worker handled corrosive chemicals with standard gloves instead of chemical-resistant gloves. Material Safety Data Sheet was not consulted.",
    "Temporary lighting in work area was insufficient. Dark spots near excavation edge. No reflective markers were placed.",
    "Vehicle entered pedestrian walkway without stopping at designated crossing. Speed bumps were painted but not physical.",
]

LOW_RISK_TEMPLATES = [
    "Worker noticed and reported a small oil spill near storage tank. Containment berms were in place. Area was cleaned within 15 minutes.",
    "Safety sign was found faded at entrance to hazardous area. Worker reported to supervisor. New sign was ordered same day.",
    "Minor first aid case: worker sustained small cut while opening package. Bandage was applied from first aid kit. No lost time.",
    "Electrical tool was found with slightly worn cord during toolbox inspection. Tool was removed from service and tagged for repair.",
    "Fire extinguisher showed pressure in yellow zone during monthly inspection. Unit was replaced from backup stock. Tag was updated.",
    "Worker noticed loose handrail on staircase. Temporary barrier was placed and maintenance was notified. Repair scheduled for next day.",
    "Small amount of debris fell from scaffold during dismantle operation. Area was cordoned and debris was cleared. No one was in zone.",
    "Operator noticed unusual vibration in pump during startup. Equipment was shut down per procedure. Maintenance team inspected and cleared.",
    "Vehicle horn was not working during pre-use inspection. Vehicle was taken out of service and horn was repaired same day.",
    "Worker reported near-miss: wrench slipped from height but hit empty area. Tool tethering requirement was reinforced in toolbox talk.",
    "Safety meeting noted that two workers were not wearing high-visibility vests. Workers corrected immediately. Trend to be monitored.",
    "Spill tray under chemical drum was half full. Drum was replaced and tray was emptied. No ground contamination occurred.",
    "Worker observed incomplete barricade around trench. Additional cones were placed. Competent person verified soil conditions were stable.",
    "Daily pre-shift briefing was not documented for one crew. Supervisor completed retroactive documentation. Template was updated.",
    "Calibration sticker on gas detector was expiring in 2 days. Detector was removed from service and sent for calibration.",
]

HAZARD_TYPES = [
    "electrical", "mechanical", "gravity", "chemical", "pressure",
    "fire", "confined_space", "loto", "ppe", "procedures",
]

MISSING_CONTROLS_BY_HAZARD = {
    "electrical": ["LOTO procedure", "Arc flash PPE", "Energized work permit", "Insulated tools"],
    "mechanical": ["Machine guarding", "Energy isolation", "Lockout devices", "Safe work procedure"],
    "gravity": ["Fall protection harness", "Guard rails", "Safety net", "Controlled access zone"],
    "chemical": ["Respiratory protection", "Chemical goggles", "Spill kit", "Ventilation system"],
    "pressure": ["Pressure relief valve", "Depressurization procedure", "Pressure gauge", "Burst disc"],
    "fire": ["Hot work permit", "Fire watch", "Fire extinguisher", "Gas-free certificate"],
    "confined_space": ["Gas testing", "Isolation procedure", "Rescue plan", "Confined space permit"],
    "loto": ["Lockout/tagout devices", "LOTO procedure", "Energy isolation verification", "Group lockout box"],
    "ppe": ["Hard hat", "Safety glasses", "High-visibility vest", "Steel-toe boots"],
    "procedures": ["Work permit", "Job safety analysis", "Supervision", "Training certification"],
}


def _generate_date(start: date, end: date) -> date:
    delta = (end - end.__class__(start.year, start.month, start.day)).days
    if delta <= 0:
        return start
    return start + timedelta(days=random.randint(0, delta))


def _pick_controls(hazard: str, count: int = 2) -> str:
    controls = MISSING_CONTROLS_BY_HAZARD.get(hazard, MISSING_CONTROLS_BY_HAZARD["procedures"])
    selected = random.sample(controls, min(count, len(controls)))
    return "; ".join(selected)


def generate_synthetic_dataset(
    num_reports: int = 250,
    output_dir: str = "data/synthetic",
) -> dict[str, str]:
    """Generate synthetic safety reports and save to CSV and JSON."""
    random.seed(42)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    reports = []
    start_date = date(2024, 1, 1)
    end_date = date(2026, 8, 24)

    for i in range(num_reports):
        roll = random.random()
        if roll < 0.25:
            templates = HIGH_RISK_TEMPLATES
            risk = "HIGH"
        elif roll < 0.60:
            templates = MEDIUM_RISK_TEMPLATES
            risk = "MEDIUM"
        else:
            templates = LOW_RISK_TEMPLATES
            risk = "LOW"

        text = random.choice(templates)
        site = random.choice(SITES)
        dept = random.choice(DEPARTMENTS)
        hazard = random.choice(HAZARD_TYPES)
        report_type = random.choice(["unsafe_act", "unsafe_condition", "near_miss"])

        report = {
            "report_id": f"SYN-{i+1:04d}",
            "report_text": text,
            "report_type": report_type,
            "site": site["name"],
            "department": dept,
            "date": _generate_date(start_date, end_date).isoformat(),
            "hazard_type": hazard,
            "work_type": random.choice(WORK_TYPES),
            "precursor_categories": hazard,
            "risk_level": risk,
            "missing_controls": _pick_controls(hazard),
            "language": "en",
            "is_synthetic": "true",
            "label_source": "synthetic",
        }
        reports.append(report)

    # Save CSV
    csv_path = output_path / "synthetic_reports.csv"
    fieldnames = list(reports[0].keys())
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(reports)

    # Save JSON
    json_path = output_path / "synthetic_reports.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump({"reports": reports, "count": len(reports), "synthetic": True}, f, indent=2)

    return {"csv": str(csv_path), "json": str(json_path), "count": len(reports)}


if __name__ == "__main__":
    result = generate_synthetic_dataset()
    print(f"Generated {result['count']} synthetic reports")
    print(f"CSV: {result['csv']}")
    print(f"JSON: {result['json']}")
