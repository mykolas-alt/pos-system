# Evaluation of the document we received

Our team received a software design document from the team (kot)letai.

The provided design document is inconsistent. For example, the second business flow shows reservations for restaurants, but in the package diagram description reservations are specifically for services. Moreover, the data model is inconsistent across all diagrams.

## Changes done in the implementation of the design

- Added `passwordHash` and `UserRoles` to `User` entity. A user needs to have a password to login securely. Roles are needed for authorization: employees can access the employee functions, while owners can edit employees and super admin can have even more control.
- Added `businessType` to `Business`. The original document only seemed to cover catering businesses, but the requirements were that we have to create a system for both catering and beauty sectors. Thats why we added a `businessType` to differentiate the type of business that was created.
- We used customer information like name and phone number instead of a customer id when creating a `Reservation`. The only information needed about the customer is name and contact information for reservations. Having a table of customers with their ids is not essential.
- Added `status`, `createdAt`, `closedAt` and `totalAmount` fields to `Reservation` entity.
- Added `note`, `serviceCharge` and `tip` to `Order` entity.
- Expanded the `OrderStatus` enum.
- Added a link to a `Reservation` to the `Payment` entity. A payment can be done to both order and reservation, but the original document only had payments for orders.
- Added options to `OrderItem` entity. The original document did not have options for products. Item options are a requirement from Lab1.
- Added `specialist` and a flag `isActive` to `Service` entity.
- Skipped the reservation for restaurants flow, because it was not mentioned in the rest of the document and there was no requirement to have reservations for restaurants.