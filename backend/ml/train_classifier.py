"""Train Crime Classification Model using TF-IDF + Logistic Regression.

This module builds a synthetic dataset of realistic complaint descriptions
across 8 categories (500-1000 examples) and trains a Logistic Regression
classifier. The trained pipeline and evaluation metrics (Accuracy, Precision,
Recall, F1-Score) are saved to disk for runtime prediction and viva inspection.
"""

import json
from pathlib import Path
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

MODEL_DIR = Path(__file__).resolve().parent / "model"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# Rich seed patterns for the 8 categories
SEEDS = {
    "Cybercrime": [
        "Received a suspicious payment link on WhatsApp asking for urgent payment verification.",
        "Bank account compromised after clicking a fraudulent APK link sent via SMS.",
        "Scammer impersonated customer support and stole OTP for UPI transaction.",
        "Victim received a fake electricity bill disconnect warning asking to install AnyDesk.",
        "Ransomware encrypted all office files and files were demanded in cryptocurrency.",
        "Social media Instagram profile hacked and used to solicit money from contacts.",
        "Phishing email pretending to be income tax refund directed to fake bank portal.",
        "Fraudulent work-from-home YouTube video liking task scam through Telegram.",
        "Credit card details cloned and unauthorized international e-commerce transaction made.",
        "Unauthorized SIM swap allowed attacker to bypass two-factor authentication and steal funds.",
        "Received fake lottery winning message asking for advance processing fee transfer.",
        "Cryptocurrency trading bot scam promised 300% returns and froze invested capital.",
        "Fake loan mobile app blackmailed contact list with manipulated private photos.",
        "Online dating romance scam convinced complainant to wire money for emergency customs clearance.",
        "Fake caller claiming to be FedEx police officer claimed courier contained contraband."
    ],
    "Theft": [
        "Mobile phone stolen from backpack while travelling in crowded metro train.",
        "Wallet containing identity cards and cash pickpocketed at busy vegetable market.",
        "Bicycle parked outside university library was stolen between morning and afternoon.",
        "Laptop taken from parked car after side window was broken in public parking.",
        "Gold ornaments stolen from bedroom cupboard while family attended a function.",
        "Unattended handbag containing cash and mobile was lifted from restaurant chair.",
        "Two-wheeler parked in front of residential apartment was missing in the morning.",
        "Store cash drawer pilfered by an unknown customer during peak shopping hours.",
        "Luggage trolley bag stolen from railway station waiting hall platform 3.",
        "Delivery package left at apartment doorstep was stolen by an unknown trespasser.",
        "Electric water pump motor stolen from agricultural field well overnight.",
        "Construction materials including copper wires stolen from unfinished building site.",
        "Wristwatch and wallet stolen from gym locker while complainant was working out.",
        "Car catalytic converter cut and stolen from vehicle parked outside house.",
        "Gas cylinder stolen from the outer verandah of the residence during the night."
    ],
    "Robbery": [
        "Gold chain snatched from neck by two men riding a black motorcycle on main road.",
        "Pedestrian threatened with knife in dark alley and forced to surrender cash and phone.",
        "Armed men entered jewellery shop, threatened staff with pistol, and looted ornaments.",
        "Delivery executive attacked with iron rod and cash collection bag was snatched away.",
        "Masked robbers broke into home at night, tied up occupants, and looted locker.",
        "Victim walking home from ATM was assaulted and robbed of newly withdrawn money.",
        "Auto driver and accomplice forcibly snatched passenger purse at knifepoint.",
        "Highway robbery where barricade was placed to stop car and passengers were looted.",
        "Two youths brandished sharp weapons and robbed cash register at local grocery store.",
        "Late-night mugging in public park where attackers beat complainant and took wallet.",
        "Victim held at knife point inside elevator and forced to transfer money via UPI.",
        "Motorcycle riders intercepted commuter, threw chili powder, and looted gold bracelet.",
        "Armed intrusion in petrol bunk cash cabin resulting in theft of daily sales proceeds.",
        "Group of 4 individuals assaulted watchman and robbed factory warehouse equipment.",
        "Chain snatchers pulled elderly woman down on the street and fled with gold mangalsutra."
    ],
    "Fraud": [
        "Builder collected advance payment for residential flat and abandoned project without refund.",
        "Ponzi scheme promised 20 percent monthly returns on gold investment and disappeared.",
        "Business partner forged signature on cheque and withdrew corporate funds illegally.",
        "Seller on marketplace took advance payment via bank transfer but never dispatched goods.",
        "Job agency collected 50,000 rupees promising overseas employment and shut office.",
        "Agent sold agricultural land using forged power of attorney documents and fake seal.",
        "Non-banking chit fund company suddenly closed down without returning depositors principal.",
        "Contractor submitted fake invoices and inflated material bills for government project.",
        "Travel agency issued fake flight tickets and hotel bookings and vanished before trip.",
        "Sub-registrar office agent prepared bogus sale deed and claimed ownership of private plot.",
        "Admission consultancy took donation for medical seat and gave counterfeit allotment letter.",
        "Automobile dealer sold accident-damaged repaired car as brand new certified vehicle.",
        "Wholesale distributor supplied expired medicines with relabeled counterfeit expiry dates.",
        "Complainant paid advance for machinery which supplier never delivered or refunded.",
        "Franchise company promised exclusive territorial rights but signed multiple parties."
    ],
    "Assault": [
        "Physically attacked and beaten with cricket bat by neighbor during parking dispute.",
        "Road rage incident where driver of oncoming car punched complainant causing bleeding.",
        "Bystander assaulted by group of drunk youth outside cinema hall after verbal dispute.",
        "Shopkeeper sustained head injuries after being attacked by customer with wooden club.",
        "Complainant beaten up by landlord and goons while demanding return of rental security deposit.",
        "Physical fight erupted at wedding reception leaving complainant with fractured arm.",
        "Delivery boy assaulted by customer over food delay resulting in severe facial bruises.",
        "Complainant was pushed to the ground and kicked repeatedly outside departmental store.",
        "Neighbour attacked senior citizen with iron pipe over garbage dumping disagreement.",
        "Physical brawl at sports ground resulting in grievous hurt and hospital admission.",
        "Tenant was physically assaulted by building owner using abusive force to evict.",
        "Complainant was intercepted while returning from market and slapped and punched violently.",
        "Group clash in village street led to physical attacks with sticks and stones.",
        "Passenger assaulted ticket examiner on local bus following ticket verification argument.",
        "Security guard beaten by visitors who were denied entry after gate closing hours."
    ],
    "Harassment": [
        "Woman stalked continuously on daily commute route by unknown bike rider.",
        "Repeated abusive and obscene phone calls from multiple unregistered numbers late at night.",
        "Ex-colleague sending threatening emails and unwanted gifts to office reception desk.",
        "Neighbor continuously filming through bedroom window causing severe mental distress.",
        "Cyber harassment where private photographs were morphed and posted on fake accounts.",
        "Complainant being followed by an unknown individual whenever leaving college campus.",
        "Landlord constantly peeping, ringing doorbell at midnight, and making inappropriate remarks.",
        "Workplace supervisor making unwelcome sexual advances and threatening termination.",
        "Continuous stalking on social media platforms accompanied by derogatory defamatory messages.",
        "Aggressive recovery agents trespassing at complainant home and shouting insults in public.",
        "Repeated blackmail threats over telephone demanding money under threat of reputation damage.",
        "Student being bullied and harassed outside tuition center by senior students daily.",
        "Complainant harassed by persistent unsolicited matrimonial messages despite blocking.",
        "Distressed by repeated offensive SMS and WhatsApp voice notes from unknown stalker.",
        "Accused intentionally followed victim in public park making obscene gestures and comments."
    ],
    "Property Dispute": [
        "Neighbor encroached upon two feet of residential boundary wall and commenced construction.",
        "Dispute over ancestral agricultural land ownership with distant relatives claiming rights.",
        "Tenant refusing to vacate commercial property after expiration of legal lease agreement.",
        "Builder constructed illegal penthouse on terrace encroaching upon common society area.",
        "Conflict regarding shared common passage access blocked by neighbor using concrete posts.",
        "Disputed land parcel forcibly occupied by relatives without legal partition deed.",
        "Neighbor diverted rainwater drainage pipeline into complainant private residential courtyard.",
        "Disagreement over survey stone markings demarcating boundary of farmland plot.",
        "Family members erected fencing cutting off access to common family well and pump.",
        "Adjacent property owner demolished shared partition wall without building permit.",
        "Encroachment on public road pathway blocking vehicular access to residential house.",
        "Contested possession of vacant commercial plot with fraudulent signboards erected.",
        "Boundary dispute regarding overhang of adjoining commercial building roof structure.",
        "Co-owner claiming exclusive possession of shared multi-story residential building.",
        "Illegal parking shed erected on society common driveway obstructing ambulance passage."
    ],
    "Other": [
        "Lost original passport and immigration documents while travelling in city taxi.",
        "Severe late-night loudspeaker noise violation disturbing elderly patients in residential area.",
        "Public nuisance caused by illegal street gathering blocking traffic movement.",
        "Lost original educational degree certificates and marks sheets in local commuter train.",
        "Stray cattle wandering on state highway causing danger to motorists and pedestrians.",
        "Complaint regarding open burning of plastic waste creating toxic smoke in neighborhood.",
        "Lost driving license and PAN card wallet during morning jog in municipal park.",
        "General public grievance regarding uncovered open drainage manhole on school road.",
        "Report of missing pet dog wearing red collar last seen near community park.",
        "Unauthorized loud party with fireworks in residential layout beyond permissible hours.",
        "Lost official company identity card and security access badge during commute.",
        "Public hygiene complaint regarding overflowing garbage bin not cleared for weeks.",
        "Report regarding dangerous dangling electric cables near primary school gate.",
        "Lost bag containing medical prescription reports and laboratory scan records.",
        "Grievance regarding defective streetlights on bypass road leading to safety hazards."
    ]
}

# Template variations to build a rich 800-sample dataset
PREFIXES = [
    "I want to report an incident: ",
    "Formal complaint regarding ",
    "Urgent grievance: ",
    "The complainant states that ",
    "Reporting an occurrence: ",
    "Please register my complaint about ",
    "Incident reported on date: ",
    "Statement of facts: "
]

SUFFIXES = [
    " Please take urgent police action.",
    " The suspect must be apprehended immediately.",
    " Requesting immediate investigation and FIR registration.",
    " I have preserved all available records and evidence.",
    " Seeking prompt intervention by the authorities.",
    " All relevant details are provided for necessary action."
]


def generate_synthetic_dataset():
    data = []
    labels = []
    
    for category, items in SEEDS.items():
        # Add base seeds
        for item in items:
            data.append(item)
            labels.append(category)
        
        # Expand using combinations to reach 100+ per category (~800-900 total)
        for i, item in enumerate(items):
            for prefix in PREFIXES[:4]:
                data.append(f"{prefix}{item}")
                labels.append(category)
            for suffix in SUFFIXES[:3]:
                data.append(f"{item}{suffix}")
                labels.append(category)
    
    return data, labels


def train():
    texts, labels = generate_synthetic_dataset()
    print(f"Total synthetic training samples generated: {len(texts)} across {len(set(labels))} categories.")
    
    train_texts, test_texts, train_labels, test_labels = train_test_split(
        texts, labels, test_size=0.20, random_state=42, stratify=labels
    )
    
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, max_features=4000)),
        ("classifier", LogisticRegression(C=2.0, max_iter=1000, random_state=42))
    ])
    
    pipeline.fit(train_texts, train_labels)
    test_preds = pipeline.predict(test_texts)
    
    accuracy = accuracy_score(test_labels, test_preds)
    precision, recall, f1, _ = precision_recall_fscore_support(test_labels, test_preds, average="weighted", zero_division=0)
    macro_p, macro_r, macro_f1, _ = precision_recall_fscore_support(test_labels, test_preds, average="macro", zero_division=0)
    
    report = classification_report(test_labels, test_preds, output_dict=True, zero_division=0)
    
    model_path = MODEL_DIR / "crime_classifier.joblib"
    joblib.dump(pipeline, model_path)
    
    metadata = {
        "model_name": "TF-IDF + Logistic Regression",
        "sample_count": len(texts),
        "train_samples": len(train_texts),
        "test_samples": len(test_texts),
        "classes": sorted(list(set(labels))),
        "metrics": {
            "accuracy": round(accuracy * 100, 2),
            "precision": round(precision * 100, 2),
            "recall": round(recall * 100, 2),
            "f1_score": round(f1 * 100, 2),
            "macro_f1": round(macro_f1 * 100, 2)
        },
        "classification_report": report
    }
    
    meta_path = MODEL_DIR / "classifier.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"=== Model Trained Successfully ===")
    print(f"Model saved to: {model_path}")
    print(f"Metadata saved to: {meta_path}")
    print(f"Accuracy:  {accuracy * 100:.2f}%")
    print(f"Precision: {precision * 100:.2f}%")
    print(f"Recall:    {recall * 100:.2f}%")
    print(f"F1-Score:  {f1 * 100:.2f}%")
    return metadata


if __name__ == "__main__":
    train()