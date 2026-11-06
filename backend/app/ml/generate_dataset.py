"""
QueueSense AI - Synthetic Training Dataset Generator
===================================================
NOTE: This script generates high-fidelity synthetic demonstration data for training
and evaluating queue waiting-time prediction models. It simulates stochastic queue
dynamics (M/M/c queuing process with non-homogeneous Poisson arrivals and priority classes).
It is NOT real confidential patient or customer data.

Features:
- arrival_hour: Hour of arrival (0-23, business hours 8-18)
- day_of_week: Day of week (0=Mon, 6=Sun)
- people_waiting: Current number of users waiting in queue
- active_counters: Number of operational counters
- average_service_time: Department standard service duration in minutes
- service_category: General Consultation, Emergency, Billing, Registration, Laboratory, Other Services
- priority_level: Regular, Senior/Disabled, VIP, Emergency
- counter_workload: Current token backlog assigned to active counters
- arrival_rate: Customers arriving per hour in current time slot
- historical_average_wait: Rolling average wait time for this category/hour
- actual_waiting_time: Ground truth target variable (minutes waited until being called)
"""

import os
import numpy as np
import pandas as pd

def generate_queue_dataset(n_samples: int = 12000, random_seed: int = 42) -> pd.DataFrame:
    np.random.seed(random_seed)

    categories = [
        "General Consultation",
        "Emergency",
        "Billing",
        "Registration",
        "Laboratory",
        "Other Services"
    ]
    # Realistic service category probabilities
    cat_weights = [0.35, 0.10, 0.20, 0.15, 0.12, 0.08]

    # Department base service times (mean, std)
    dept_service_times = {
        "General Consultation": (9.5, 2.5),
        "Emergency": (14.0, 4.0),
        "Billing": (4.5, 1.2),
        "Registration": (5.0, 1.5),
        "Laboratory": (11.0, 3.0),
        "Other Services": (7.0, 2.0)
    }

    priorities = ["Regular", "Senior/Disabled", "VIP", "Emergency"]
    prio_weights = [0.72, 0.15, 0.05, 0.08]

    # Sample service categories
    sample_cats = np.random.choice(categories, size=n_samples, p=cat_weights)

    # Sample priorities (if category is Emergency, priority is always Emergency)
    sample_prios = []
    for cat in sample_cats:
        if cat == "Emergency":
            sample_prios.append("Emergency")
        else:
            prio = np.random.choice(priorities, p=prio_weights)
            sample_prios.append(prio)
    sample_prios = np.array(sample_prios)

    # Days of week (0=Monday to 6=Sunday). Weekdays have 85% of volume
    day_weights = [0.18, 0.18, 0.17, 0.17, 0.18, 0.07, 0.05]
    day_of_week = np.random.choice(np.arange(7), size=n_samples, p=day_weights)

    # Arrival hour: operational window 8:00 to 19:00 with morning peak (10-12) and afternoon peak (14-16)
    hours = np.arange(8, 20)
    hour_probs = [0.04, 0.09, 0.15, 0.16, 0.11, 0.07, 0.12, 0.13, 0.06, 0.04, 0.02, 0.01]
    hour_probs = np.array(hour_probs) / sum(hour_probs)
    arrival_hour = np.random.choice(hours, size=n_samples, p=hour_probs)

    # Active counters (typically 2 to 8 active counters)
    # Peak hours have more active counters
    active_counters = []
    for h in arrival_hour:
        if 10 <= h <= 15:
            c = np.random.choice([4, 5, 6, 7, 8], p=[0.1, 0.25, 0.35, 0.2, 0.1])
        else:
            c = np.random.choice([2, 3, 4, 5], p=[0.25, 0.45, 0.2, 0.1])
        active_counters.append(c)
    active_counters = np.array(active_counters)

    # Arrival rate (customers / hour in current window)
    arrival_rates = []
    for h in arrival_hour:
        if 10 <= h <= 12:
            rate = np.random.normal(48, 6)
        elif 14 <= h <= 16:
            rate = np.random.normal(42, 5)
        else:
            rate = np.random.normal(24, 4)
        arrival_rates.append(max(5.0, rate))
    arrival_rates = np.round(arrival_rates, 1)

    # People waiting in queue when user arrives:
    # Dependent on arrival rate vs service capacity
    people_waiting = []
    for i in range(n_samples):
        h = arrival_hour[i]
        c = active_counters[i]
        lam = arrival_rates[i]
        
        # Traffic intensity rho approx lam / (c * mu)
        base_queue = (lam / (c * 6.0)) * 4.0
        q = np.random.poisson(lam=max(1.0, base_queue * 2.2))
        # Add random spike during peak hours
        if 10 <= h <= 12 and np.random.rand() < 0.25:
            q += np.random.randint(5, 15)
        people_waiting.append(min(q, 45))
    people_waiting = np.array(people_waiting)

    # Average service time per department
    avg_service_time = []
    for cat in sample_cats:
        m, s = dept_service_times[cat]
        val = np.random.normal(m, s * 0.3)
        avg_service_time.append(round(max(2.5, val), 2))
    avg_service_time = np.array(avg_service_time)

    # Counter workload (estimated backlog across counters)
    counter_workload = []
    for i in range(n_samples):
        wl = (people_waiting[i] * avg_service_time[i]) / active_counters[i]
        # Stochastic variance
        wl += np.random.normal(0, 1.5)
        counter_workload.append(round(max(0.5, wl), 2))
    counter_workload = np.array(counter_workload)

    # Historical average wait for the category during that hour
    hist_average_wait = []
    for i in range(n_samples):
        cat = sample_cats[i]
        base_m = dept_service_times[cat][0]
        h = arrival_hour[i]
        peak_factor = 1.35 if (10 <= h <= 12 or 14 <= h <= 16) else 0.95
        hist = (base_m * 1.5) * peak_factor
        hist_average_wait.append(round(hist, 2))
    hist_average_wait = np.array(hist_average_wait)

    # ACTUAL WAITING TIME CALCULATION (Target variable)
    # Based on M/M/c queuing physics:
    # Wait time = (people_waiting / active_counters) * avg_service_time
    # Adjusted by priority rules:
    # - Emergency: Fast-tracked, 80% reduction in wait (triage queue)
    # - VIP: 40% reduction
    # - Senior/Disabled: 30% reduction
    # - Regular: standard queue order
    actual_waiting_times = []
    for i in range(n_samples):
        q = people_waiting[i]
        c = active_counters[i]
        mu = avg_service_time[i]
        prio = sample_prios[i]

        # Base multi-server queue wait
        raw_wait = (q / c) * mu

        # Workload & peak hour delay factor
        h = arrival_hour[i]
        rush_multiplier = 1.15 if (10 <= h <= 12 or 14 <= h <= 16) else 1.0

        # Priority scaling
        if prio == "Emergency":
            wait = raw_wait * 0.15 + np.random.uniform(0.5, 3.0)
        elif prio == "Senior/Disabled":
            wait = (raw_wait * 0.70) * rush_multiplier + np.random.normal(1.0, 0.5)
        elif prio == "VIP":
            wait = (raw_wait * 0.60) * rush_multiplier + np.random.normal(1.0, 0.5)
        else:
            # Regular
            wait = raw_wait * rush_multiplier + np.random.normal(1.5, 1.0)

        # Stochastic noise (individual customer variations)
        noise = np.random.normal(0, 1.2)
        final_wait = max(1.0, round(wait + noise, 2))
        actual_waiting_times.append(final_wait)

    actual_waiting_times = np.array(actual_waiting_times)

    df = pd.DataFrame({
        "arrival_hour": arrival_hour,
        "day_of_week": day_of_week,
        "people_waiting": people_waiting,
        "active_counters": active_counters,
        "average_service_time": avg_service_time,
        "service_category": sample_cats,
        "priority_level": sample_prios,
        "counter_workload": counter_workload,
        "arrival_rate": arrival_rates,
        "historical_average_wait": hist_average_wait,
        "actual_waiting_time": actual_waiting_times
    })

    return df

def save_dataset():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_dir = os.path.join(base_dir, "data")
    os.makedirs(data_dir, exist_ok=True)
    csv_path = os.path.join(data_dir, "queue_training_data.csv")

    print("Generating synthetic queue dataset (12,000 records)...")
    df = generate_queue_dataset(n_samples=12000)
    df.to_csv(csv_path, index=False)
    print(f"Dataset successfully created and saved to: {csv_path}")
    print("Dataset summary:")
    print(df.describe())
    return csv_path

if __name__ == "__main__":
    save_dataset()
