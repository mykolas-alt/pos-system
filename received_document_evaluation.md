# Evaluation of the document we received

Our team received a software design document from the team (kot)letai.

The provided design document is inconsistent. For example, the second business flow shows reservations for restaurants, but in the package diagram description reservations are specifically for services. Moreover, the data model is inconsistent across all diagrams.

## Changes done in the implementation of the design

- Added `passwordHash` and `UserRoles` to `User` entity.
- Added `businessType` to `Business`.
- We used customer information like name and phone number instead of a customer id when creating a `Reservation`.
- Added `status`, `createdAt`, `closedAt` and `totalAmount` fields to `Reservation` entity.
- Added `note`, `serviceCharge` and `tip` to `Order` entity.
- Expanded the `OrderStatus` enum.
- Added a link to a `Reservation` to the `Payment` entity.
- Added options to `OrderItem` entity.
- Added `specialist` and a flag `isActive` to `Service` entity.