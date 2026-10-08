# User Create API Updates Guide

This guide outlines the changes required in the backend API to align with the updated frontend User Creation form. We have streamlined the user creation process to include only the essential fields requested.

## Updated Payload Structure

The frontend will now only send the following fields when creating a user. Please update the `accounts` model and serializers to accept exactly these fields:

### Basic Info
- **`username`** (string, required): The unique username.
- **`email`** (string, required): Official Email address.
- **`phone`** (string, required): Phone number.
- **`gender`** (string, optional/default 'Male'): User's gender.
- **`address`** (string, optional): Combined field for Address and City.

### Account & Role
- **`role`** (string, required): System Role identifier.
- **`designation`** (string, optional): User's designation in the system.
- **`status`** (string, required): Account status (e.g., Active, Inactive, Suspended).
- **`password`** (string, required): Password for the user account.
- **`confirmPassword`** (string, required): Should be validated against `password`.
- **`twoFactorEnabled`** (boolean, default false): Flag for Enforce 2FA Authentication.

## Fields to Remove / Make Optional

The following fields have been **removed** from the frontend form. If these fields are currently marked as required in the backend database models or serializers, you must either remove them entirely or make them optional (`null=True, blank=True` in Django):

- `fullName`, `firstName`, `lastName`
- `altPhone`
- `dob`
- `department`
- `employeeId`
- `company`
- `branch`
- `joiningDate`
- `manager`
- `shift`
- `state`, `country`, `postalCode`
- `notes`
- `accountExpiry`
- `avatar`

## Action Items for Backend Developer

1. Update the Django `User` model (in `accounts/models.py`) to ensure the removed fields are no longer required, or remove them entirely if they are no longer needed anywhere in the system.
2. Update the `UserCreateSerializer` (in `accounts/serializers.py`) to validate and process only the fields listed in the **Updated Payload Structure** section above.
3. Ensure the create endpoint (`POST /accounts/users/` or similar) correctly processes the new streamlined payload.
4. If you have custom validation logic (e.g., checking `department` or `company`), please remove or conditionalize it since the frontend will no longer supply these values on user creation.
