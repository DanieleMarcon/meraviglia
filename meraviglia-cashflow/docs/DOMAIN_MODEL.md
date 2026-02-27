# Domain Model – Meraviglia Engine

This document describes the core conceptual entities.

---

# ServiceDefinition

Represents a catalog entry.

Attributes:

- id
- nome
- categoria
- prezzoPieno
- prezzoScontato
- durataStandard
- colore
- consentiRateizzazione
- consentiAcconto
- maxRateConsentite

---

# Service (Proposal Instance)

Derived from ServiceDefinition.

Adds:

- meseInizio
- durataOperativa
- usaPrezzoScontato

---

# StrategiaPagamento

Defines payment logic:

- oneShot
- rate
- abbonamento
- accontoRate

Parameters:

- numeroRate
- percentualeAcconto

---

# Proposta

Contains:

- id
- nome
- servizi[]

---

# PianoStrategico

Contains:

- durataTotale
- moduli[]

---

# Modulo

Represents a strategic phase:

- nome
- durata
- meseInizio (derived from order)

---

# Conceptual Flow

ServiceDefinition → Service → Proposta → CashflowEngine → Timeline → Visualization