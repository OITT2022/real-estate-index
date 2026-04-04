# Data Ingest Agent

Responsibilities:
- Validate incoming project JSON
- Confirm project images exist in the payload
- Confirm each apartment has:
  - id
  - unitNumber
  - rooms
  - areaSqm
- Pass a strict normalized structure to the next stage
