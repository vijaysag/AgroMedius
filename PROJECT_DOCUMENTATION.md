# AgroMedius - Technical Documentation

AgroMedius is a smart agricultural marketplace designed to connect farmers directly with wholesalers, eliminating middle-men and providing AI-driven insights.

## 1. System Architecture
AgroMedius uses a client-server architecture with a centralized database.

```mermaid
graph TD
    subgraph Client_Side [Frontend - React]
        UI[Tailwind UI]
        Context[States: AuthContext]
        API_Call[Axios Instance]
    end

    subgraph Server_Side [Backend - Node.js/Express]
        Routes[API Routes]
        Middleware[JWT Auth Middleware]
        Controllers[Business Logic]
        Sequelize[Sequelize ORM]
    end

    subgraph Storage_Layer [Database]
        DB[(SQLite File)]
    end

    UI --> Context
    Context --> API_Call
    API_Call -- "Bearer Token" --> Routes
    Routes --> Middleware
    Middleware --> Controllers
    Controllers --> Sequelize
    Sequelize --> DB
```

---

## 2. Entity Relationship Diagram (ERD)
The database structure focused on User roles, Crop listings, and Order management.

```mermaid
erDiagram
    USER ||--o{ CROP : "manages"
    USER ||--o{ ORDER : "places/receives"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ MESSAGE : "chat history"
    CROP ||--o{ ORDER : "is item in"

    USER {
        uuid id PK
        string name
        string email
        string role "farmer | wholesaler"
        string phone
        json location
    }

    CROP {
        uuid id PK
        uuid farmerId FK
        string name
        float quantity
        float pricePerUnit
        string farmerPhone "Direct Contact Override"
        string growthStatus "sowing | growing | ready | sold"
    }

    ORDER {
        uuid id PK
        uuid cropId FK
        uuid farmerId FK
        uuid wholesalerId FK
        float quantity
        float totalPrice
        string status "pending | accepted | rejected | cancelled"
    }
```

---

## 3. Order Lifecycle (State Machine)
Ensures inventory integrity. When an order is rejected/cancelled, quantity is automatically returned to the crop listing.

```mermaid
stateDiagram-v2
    [*] --> Pending : Wholesaler creates order
    Pending --> Accepted : Farmer accepts
    Pending --> Rejected : Farmer rejects
    Pending --> Cancelled : Wholesaler cancels
    
    Rejected --> RestoringStock : System Logic
    Cancelled --> RestoringStock : System Logic
    
    RestoringStock --> ListingAvailable : Quantity added back
    ListingAvailable --> [*]
    
    Accepted --> Completed : Transaction Done
    Completed --> [*]
```

---

## 4. Sequence Diagram: Booking Process
Details the interaction between the user and the system during a purchase.

```mermaid
sequenceDiagram
    actor Wholesaler
    participant Frontend
    participant API
    participant DB

    Wholesaler->>Frontend: Select Quantity & Click 'Book'
    Frontend->>API: POST /api/orders
    API->>DB: Verify Stock & Farmer ID
    alt In Stock
        DB-->>API: Validated
        API->>DB: Deduct Crop Quantity
        API->>DB: Create Order instance
        API->>DB: Create Farmer Notification
        DB-->>API: Success
        API-->>Frontend: 201 Created
        Frontend-->>Wholesaler: Show Success Toast
    else Insufficient Stock
        API-->>Frontend: 400 Error
        Frontend-->>Wholesaler: Show 'Insufficient Quantity'
    end
```

---

## 5. Key Use Cases
*   **Farmers:** List crops, set specific contact numbers per listing, manage booking requests, and message buyers.
*   **Wholesalers:** Browse Marketplace using filters (City, Category, Price), view AI suggestions, and book crops directly.
*   **System:** Automatically syncs profile data, handles database schema migrations, and sends real-time alerts.

---

## 6. Implementation Notes
*   **Security:** API routes are protected by a JWT-based middleware. Roles are enforced at the Route level.
*   **Database Migration:** The system uses a manual migration script in `db.js` to handle dynamic column additions (e.g., the recent `farmerPhone` addition).
*   **Accessibility:** The `farmerPhone` field defaults to the user's profile phone during crop creation to minimize data entry.
