# FleetForge

FleetForge is a Car Dealership Management System (CDMS) engineered for multi-showroom automotive enterprises. Developed as a final deliverable for CS323 (Database Systems), the application supports end-to-end operational lifecycle tracking—from vehicle inventory allocation and point-of-sale transactions to in-house financing, servicing, warranty claims, and rentals.

---

## Architectural Summary

FleetForge is structured as a relational database application emphasizing strict data integrity, row-level data isolation, transactional consistency, and role-based operational security.

* **Database Engine:** Managed MariaDB / MySQL hosted via Aiven.
* **Backend Application:** Python 3.11 with Django (Views, Templates, and Session Security).
* **Data Access Layer:** Direct hand-crafted SQL execution using database cursors (`django.db.connection`), avoiding ORM abstraction to demonstrate strict SQL DDL, DML, triggers, and stored procedures.
* **Package Management:** Managed via `uv`.

---

## Core System Modules

1. **Vehicle Inventory & Multi-Showroom Transfers:** VIN-level tracking across showrooms with explicit inter-showroom inventory movement logging.
2. **Customer Management:** Profiles, transaction history, and credit validation for financing and rental eligibility.
3. **Point-of-Sale & Trade-Ins:** Sales processing, trade-in vehicle intake into inventory, and automated salesperson commission calculations.
4. **In-House Short-Term Financing:** Short-term installment management enforcing a minimum 40% deposit and 12-month tenure limits.
5. **Vehicle Servicing & Split Billing:** Work order management supporting line-item level billing split between customer out-of-pocket and warranty coverage.
6. **Warranty Claims:** Coverage policy validation and claim reimbursement tracking.
7. **Vehicle Rentals:** Agreement tracking with daily rate calculations, maximum 180-day lease boundaries, and overdue penalty fee computation.
8. **Role-Based Access Control (RBAC):** UI and data isolation scoped across 5 distinct staff roles (System Admin, Showroom Manager, Salesperson, Service Technician, F&I Manager).

---

## Local Development Setup

### Prerequisites
* Python 3.11+
* `uv` package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/onkhida/fleetforge
cd fleetforge
```
2. Install dependencies using `uv`:
```bash
uv sync
```
3. Configure environment variables in a `.env` file at the root level:
```
SECRET_KEY=your_secret_key
DEBUG=True
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=your_password
DB_HOST=your_host
DB_PORT=25740
```
4. We used Aiven to host the database online. If you make the same stylistic choice, rememeber to place the Aiven SSL certificate (`ca.pem`) in the root directory.
5. Verify database connectivity and start the server:
```bash
uv run python manage.py check
uv run python manage.py runserver
```