# SOLID Principles

These are the five object-oriented design principles introduced by Robert C. Martin (Uncle Bob).
They help us to write clean, maintainable and scalable code by enforcing good design practices.

SOLID stands for:

- **S**: Single Responsibility Principle
- **O**: Open/Closed Principle
- **L**: Liskov Substitution Principle
- **I**: Interface Segregation Principle
- **D**: Dependency Inversion Principle

## Single Responsibility Principle (SRP)

> "A class should have only one reason to change."

Means a class should have only one job or responsibility.

### Example

Without SRP

```typescript
class UserService {
  constructor() {}

  createUser() {
    console.log("Saving user to database...");
  }

  sendWelcomeEmail() {
    console.log("Sending email...");
  }
}
```

Here `userService` has two responsibilities: user persistence logic and email logic.

If email logic changes, we need to modify `UserService`, violating SRP.

With SRP

```typescript
class UserRepository {
  constructor() {}

  createUser() {
    console.log("Saving user to database...");
  }
}

class EmailService {
  constructor() {}

  sendWelcomeEmail() {
    console.log("Sending email...");
  }
}
```

Now

- `UserRepository` handles persistence logic.
- `EmailService` handles email logic.

With SRP, each class has a single responsibility. And we can have a third class `UserService` that can act as an orchestrator (coordination layer) between `UserRepository` and `EmailService`.

```typescript
class UserService {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}

  registerUser() {
    this.userRepository.createUser();
    this.emailService.sendWelcomeEmail();
  }
}
```

It helps in:

- Reducing the impact of changes: If the email service changes, we only modify `EmailService`, not `UserService`.
- Enhancing testability: We can easily mock `UserRepository` and `EmailService` in unit tests.
- Improving code readability: Each class has a clear purpose, making the codebase easier to understand.
- Clearer fault isolation (if email fails, you don’t dig into DB code).

Things to keep in mind:

- SRP is about reasons to change, not the number of methods. A class can have multiple methods as long as they relate to a single responsibility.
- For example, `UserRepository` is responsible for persistence, but it can have multiple methods like `createUser`, `updateUser`, `deleteUser`.
- Don’t break classes unnecessarily into tiny ones. SRP should reduce coupling and clarify responsibilities, not overcomplicate design.

## Open/Closed Principle (OCP)

> "Objects or entities should be open for extension but closed for modification."

Means we should be able to add new functionality without changing existing code.

### Example

Without OCP

```typescript
class PaymentProcessor {
  process(type: string) {
    if (type === "paypal") {
      console.log("Processing PayPal payment");
    } else if (type === "stripe") {
      console.log("Processing Stripe payment");
    }
  }
}
```

Here, if we want to add a new payment type method let'say `razorpay` , we need to modify the `PaymentProcessor` class that might introduce bugs in already tested code or break existing behavior.

With OCP

```typescript
abstract class Payment {
  abstract pay(amount: number): void;
}

class PaypalPayment extends Payment {
  pay(amount: number) {
    console.log("Processing PayPal payment");
  }
}

class StripePayment extends Payment {
  pay(amount: number) {
    console.log("Processing Stripe payment");
  }
}

class PaymentProcessor {
  constructor(private payment: Payment) {}
  process(amount: number) {
    this.payment.pay(amount);
  }
}
```

Now, if we want to add a new payment type `razorpay`, we just need to create a new class `RazorpayPayment` that extends `Payment` class without modifying existing code.

```typescript
class RazorpayPayment extends Payment {
  pay(amount: number) {
    console.log("Processing Razorpay payment");
  }
}
```

It helps in:

- Adding new functionality without risking existing behavior.
- Encouraging polymorphism and clean abstractions.
- Making code easier to extend when requirements evolve.
- Avoiding “if-else bloat” as more cases get added.

Things to keep in mind:

- OCP doesn’t mean never modify code. Fixing bugs or refactoring is valid.
- The goal is to avoid repeated modification when adding new features.

## Liskov Substitution Principle (LSP)

> "Objects of a parent class should be replaceable with objects of its child class without breaking the system."

LSP ensures that a subclass can be used in place of its superclass without causing issues. In other words, subtypes must honor the behavioral contract of their parent type.

### Example

Without LSP

```typescript
aabstract class FileStorage {
  abstract saveFile(fileName: string, data: string): void;
}

class LocalStorage extends FileStorage {
  saveFile(fileName: string, data: string): void {
    console.log(`Saving file to local disk...`);
  }
}

class S3Storage extends FileStorage {
  saveFile(fileName: string, data: string): void {
    console.log(`Saving file to AWS S3...`);
  }
}

class ReadOnlyStorage extends FileStorage {
  saveFile(fileName: string, data: string): void {
    throw new Error("Read-only storage cannot save files");
  }
}
```

Here, `ReadOnlyStorage` violates LSP because it cannot be used interchangeably with `FileStorage`.
Any client that expects a `FileStorage` and calls `saveFile` will break if given `ReadOnlyStorage`.

With LSP
We separate the abstractions so that storage types only implement behaviors they actually support.

```typescript
interface ReadableStorage {
  readFile(fileName: string): string;
}

interface WritableStorage extends ReadableStorage {
  saveFile(fileName: string, data: string): void;
}

class LocalStorage implements WritableStorage {
  saveFile(fileName: string, data: string): void {
    console.log(`Saving file to local disk...`);
  }
  readFile(fileName: string): string {
    return "Reading from local disk";
  }
}

class S3Storage implements WritableStorage {
  saveFile(fileName: string, data: string): void {
    console.log(`Uploading file to AWS S3...`);
  }
  readFile(fileName: string): string {
    return "Reading data from S3";
  }
}

class ReadOnlyStorage implements ReadableStorage {
  readFile(fileName: string): string {
    return "Reading data from read-only storage";
  }
}
```

Now:

- LocalStorage and S3Storage can both read and write.
- ReadOnlyStorage only reads.
- Clients depending on WritableStorage will never get a ReadOnlyStorage by mistake.

This respects LSP because no subclass (or implementation) weakens the contract of its parent.

It helps in:

- Ensuring subclasses truly honor the parent’s contract.
- Preventing runtime surprises (like unexpected errors in overridden methods).
- Encouraging composition or interfaces when inheritance doesn’t fit perfectly.
- Making APIs more predictable: a WritableStorage is always writable.

Things to keep in mind:

- If a subclass throws errors or ignores parts of the parent’s contract → it’s a red flag.
- Prefer composition or multiple small interfaces if not all subclasses share the same behavior.
- LSP is often violated when inheritance is used where composition or interfaces would be better.
