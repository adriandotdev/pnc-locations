# GraphQL API Documentation

This document provides an overview of the GraphQL API endpoints, queries, mutations, and their respective fields.

## Endpoints

- **URL**: [Provide the URL of the GraphQL API endpoint]

---

## Authentication

Access to the GraphQL API requires the use of tokens for authentication. The type of token required depends on the specific endpoint:

- **Basic Token**: Required for queries/mutations that do not involve user-specific data.
- **Access Token**: Required for queries/mutations that involve user-specific data or modifications.

---

## Queries

### cpo_owners

- **Description**: Retrieves a list of CPO (Charge Point Operator) owners.
- **Fields**:
  - id (Int): The unique identifier of the CPO owner.
  - user_id (Int): The ID of the user associated with the CPO owner.
  - party_id (String): The party ID of the CPO owner.
  - cpo_owner_name (String): The name of the CPO owner.
  - contact_name (String): The contact name of the CPO owner.
  - contact_number (String): The contact number of the CPO owner.
  - contact_email (String): The contact email of the CPO owner.
  - logo (String): The logo URL of the CPO owner.

### location

- **Description**: Retrieves details of a specific location.
- **Fields**:
  - id (Int): The unique identifier of the location.
  - publish (Boolean): Indicates if the location is published.
  - name (String): The name of the location.
  - address (String): The address of the location.
  - address_lat (Float): The latitude of the location.
  - address_lng (Float): The longitude of the location.
  - city (String): The city where the location is situated.
  - date_created (String): The date when the location was created.
  - date_modified (String): The date when the location was last modified.
  - distance (Float): The distance of the location from a specified point.
  - evses ([EVSE]): List of EVSEs available at the location.
  - facilities ([LocationFacility]): List of facilities available at the location.
  - parking_restrictions ([LocationParkingRestriction]): List of parking restrictions at the location.
  - parking_types ([LocationParkingType]): List of parking types available at the location.

---

### location_with_favorites

- **Description**: Retrieves details of a specific location along with its favorite status.
- **Fields**:
  - id (Int): The unique identifier of the location.
  - publish (Boolean): Indicates if the location is published.
  - name (String): The name of the location.
  - address (String): The address of the location.
  - address_lat (Float): The latitude of the location.
  - address_lng (Float): The longitude of the location.
  - city (String): The city where the location is situated.
  - date_created (String): The date when the location was created.
  - date_modified (String): The date when the location was last modified.
  - distance (Float): The distance of the location from a specified point.
  - favorite (String): Indicates if the location is marked as a favorite by the user.
  - evses ([EVSE]): List of EVSEs available at the location.
  - facilities ([LocationFacility]): List of facilities available at the location.
  - parking_restrictions ([LocationParkingRestriction]): List of parking restrictions at the location.
  - parking_types ([LocationParkingType]): List of parking types available at the location.

---

### locations

- **Description**: Retrieves a list of locations based on provided latitude and longitude.
- **Fields**:
  - id (Int): The unique identifier of the location.
  - publish (Boolean): Indicates if the location is published.
  - name (String): The name of the location.
  - address (String): The address of the location.
  - address_lat (Float): The latitude of the location.
  - address_lng (Float): The longitude of the location.
  - city (String): The city where the location is situated.
  - date_created (String): The date when the location was created.
  - date_modified (String): The date when the location was last modified.
  - distance (Float): The distance of the location from a specified point.
  - evses ([EVSE]): List of EVSEs available at the location.
  - facilities ([LocationFacility]): List of facilities available at the location.
  - parking_restrictions ([LocationParkingRestriction]): List of parking restrictions at the location.
  - parking_types ([LocationParkingType]): List of parking types available at the location.

---

### locations_with_favorites

- **Description**: Retrieves a list of locations along with their favorite status.
- **Fields**:
  - id (Int): The unique identifier of the location.
  - publish (Boolean): Indicates if the location is published.
  - name (String): The name of the location.
  - address (String): The address of the location.
  - address_lat (Float): The latitude of the location.
  - address_lng (Float): The longitude of the location.
  - city (String): The city where the location is situated.
  - date_created (String): The date when the location was created.
  - date_modified (String): The date when the location was last modified.
  - distance (Float): The distance of the location from a specified point.
  - favorite (String): Indicates if the location is marked as a favorite by the user.
  - evses ([EVSE]): List of EVSEs available at the location.
  - facilities ([LocationFacility]): List of facilities available at the location.
  - parking_restrictions ([LocationParkingRestriction]): List of parking restrictions at the location.
  - parking_types ([LocationParkingType]): List of parking types available at the location.

---

### filter_locations

- **Description**: Filters locations based on various criteria.
- **Fields**:
  - id (Int): The unique identifier of the location.
  - publish (Boolean): Indicates if the location is published.
  - name (String): The name of the location.
  - address (String): The address of the location.
  - address_lat (Float): The latitude of the location.
  - address_lng (Float): The longitude of the location.
  - city (String): The city where the location is situated.
  - date_created (String): The date when the
