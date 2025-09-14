# SOLID Principles

These are the five object-oriented design principles introduced by Robert C. Martin (Uncle Bob).
They help us to write clean, maintainable and scalable code by enforcing good design practices.

SOLID stands for:

- **S**: Single Responsibility Principle
- **O**: Open/Closed Principle
- **L**: Liskov Substitution Principle
- **I**: Interface Segregation Principle
- **D**: Dependency Inversion Principle

#

Before we dive into each principle, here are some key concepts to understand:

- **Cohesion**

  How well the parts of a class/module belong together.

  - High cohesion → The class has a clear, focused responsibility (good).
  - Low cohesion → The class does too many unrelated things (bad).

- **Coupling**

  How strongly one class depends on another.

  - High coupling → Classes are tightly connected, changes in one may break the other (bad).
  - Low coupling → Classes can change independently (good).

## Single Responsibility Principle (SRP)

> "A class should have only one reason to change."

Means a class should have only one job or responsibility.

### Example

**Without SRP**

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

**With SRP**

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

**Without OCP**

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

**With OCP**

```typescript
abstract class Payment {
  abstract pay(): void;
}

class PaypalPayment extends Payment {
  pay() {
    console.log("Processing PayPal payment");
  }
}

class StripePayment extends Payment {
  pay() {
    console.log("Processing Stripe payment");
  }
}

class PaymentProcessor {
  constructor(private payment: Payment) {}
  process() {
    this.payment.pay();
  }
}
```

Now, if we want to add a new payment type `razorpay`, we just need to create a new class `RazorpayPayment` that extends `Payment` class without modifying existing code.

```typescript
class RazorpayPayment extends Payment {
  pay() {
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

**Without LSP**

```typescript
abstract class FileStorage {
  abstract saveFile(): void;
}

class LocalStorage extends FileStorage {
  saveFile(): void {
    console.log(`Saving file to local disk...`);
  }
}

class S3Storage extends FileStorage {
  saveFile(): void {
    console.log(`Saving file to AWS S3...`);
  }
}

class ReadOnlyStorage extends FileStorage {
  saveFile(): void {
    throw new Error("Read-only storage cannot save files");
  }
}
```

Here, `ReadOnlyStorage` violates LSP because it cannot be used interchangeably with `FileStorage`.
Any client that expects a `FileStorage` and calls `saveFile` will break if given `ReadOnlyStorage`.

**With LSP**

We separate the abstractions so that storage types only implement behaviors they actually support.

```typescript
interface ReadableStorage {
  readFile(): string;
}

interface WritableStorage extends ReadableStorage {
  saveFile(): void;
}

class LocalStorage implements WritableStorage {
  saveFile(): void {
    console.log(`Saving file to local disk...`);
  }
  readFile(): string {
    return "Reading from local disk...";
  }
}

class S3Storage implements WritableStorage {
  saveFile(): void {
    console.log(`Uploading file to AWS S3...`);
  }
  readFile(): string {
    return "Reading data from S3...";
  }
}

class ReadOnlyStorage implements ReadableStorage {
  readFile(): string {
    return "Reading data from read-only storage...";
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

## Interface Segregation Principle (ISP)

> "Don’t force classes to implement interfaces they don’t use."

Means we should create small, specific interfaces rather than large, general-purpose ones.

### Example

**Without ISP**

```typescript
interface AuthService {
  loginWithEmail(): void;
  loginWithGoogle(): void;
  loginWithGithub(): void;
}

class EmailAuthService implements AuthService {
  loginWithEmail(): void {
    console.log("User logged in with email");
  }

  loginWithGoogle(): void {
    throw new Error("Google login not supported");
  }

  loginWithGithub(): void {
    throw new Error("GitHub login not supported");
  }
}
```

Here, `EmailAuthService` is forced to implement methods irrelevant to its responsibility, violating ISP.

**With ISP**

We create smaller, purpose-specific interfaces for each authentication method.

```typescript
interface EmailAuth {
  loginWithEmail(): void;
}

interface GoogleAuth {
  loginWithGoogle(): void;
}

interface GithubAuth {
  loginWithGithub(): void;
}

class EmailAuthService implements EmailAuth {
  loginWithEmail(): void {
    console.log("User logged in with email");
  }
}

class GoogleAuthService implements GoogleAuth {
  loginWithGoogle(): void {
    console.log("User logged in with Google");
  }
}

class GithubAuthService implements GithubAuth {
  loginWithGithub(): void {
    console.log("User logged in with GitHub");
  }
}

class MultiAuthService implements EmailAuth, GoogleAuth, GithubAuth {
  loginWithEmail(): void {
    console.log("User logged in with email");
  }
  loginWithGoogle(): void {
    console.log("User logged in with Google");
  }
  loginWithGithub(): void {
    console.log("User logged in with GitHub");
  }
}
```

Now:

- `EmailAuthService` only implements `EmailAuth`.
- `GoogleAuthService` only implements `GoogleAuth`.
- `MultiAuthService` implements all three for systems that support multiple login methods.
- No class is forced to depend on methods it doesn’t use.

It helps in

- Avoiding bloated interfaces that cover multiple unrelated features.
- Making code easier to maintain (changes in one interface don’t affect others).
- Encouraging high cohesion and separation of concerns.
- Supporting flexibility: classes implement only what they truly need.

Things to keep in mind

- A large interface with many unrelated methods is usually a design smell.
- ISP naturally pushes you to design more modular contracts.
- Small, purpose-specific interfaces are better than a single “god” interface.
- ISP is closely related to SRP: each interface should have a single responsibility.

## Dependency Inversion Principle (DIP)

> "High-level modules should not depend on low-level modules. Both should depend on abstractions."

Means we should depend on abstractions (interfaces or base classes) rather than concrete implementations.

### Example

**Without DIP**

```typescript
class MySQLDatabase {
  save(): void {
    console.log("Saving data to MySQL...");
  }
}

class UserService {
  private database: MySQLDatabase;

  constructor() {
    this.database = new MySQLDatabase(); // tightly coupled
  }

  createUser(user: string) {
    this.database.save();
  }
}
```

Here, `UserService` is tightly coupled to `MySQLDatabase`.
If tomorrow you want to use MongoDB or PostgreSQL, you must modify UserService, which breaks **OCP** and makes testing harder.

**With DIP**

We introduce an abstraction (`Database` interface). Both `UserService` and database implementations depend on it.

```typescript
interface Database {
  save(): void;
}

class MySQLDatabase implements Database {
  save(): void {
    console.log("Saving data to MySQL...");
  }
}

class MongoDBDatabase implements Database {
  save(): void {
    console.log("Saving data to MongoDB...");
  }
}

class UserService {
  constructor(private database: Database) {}

  createUser(user: string) {
    this.database.save();
  }
}
```

Now:

- `UserService` depends on the `Database` abstraction, not a specific implementation.
- Switching to **MongoDB** just means injecting a new dependency.

```typescript
const userService = new UserService(new MongoDBDatabase());
userService.createUser("Alice");
```

It helps in

- Flexibility: Swap implementations without touching business logic.
- Testability: Easily mock dependencies (e.g., using mock databases).
- Separation of concerns: High-level policies and low-level details evolve independently.

Things to keep in mind

- Always depend on abstractions, not concrete implementations.
- DIP is often violated when high-level modules directly instantiate low-level modules.
- Use dependency injection to adhere to DIP.

#

Before we end, let’s quickly touch on IoC and DI, since they often come up with SOLID.

## Inversion of Control (IoC) and Dependency Injection (DI)

### Dependency Injection (DI)

> "DI is giving a class the dependencies it needs from the outside instead of creating them inside."

**Let’s break it down:**

- Dependency → What your class needs (e.g., a database).
- Injection → Instead of creating it inside, you give it from outside.

This makes code **flexible** (swap MySQL ↔ Mongo easily), **testable** (inject mocks), and **clean** (class focuses on its job, not object creation.).

**Example**

- Without DI → `UserService` directly creates `MySQLDatabase`.
- With DI → `UserService` just says “I need a Database”, and we inject `MySQLDatabase`, `MongoDBDatabase`, or `FakeDatabase` as needed.

### Inversion of Control (IoC)

> "IoC means your classes don’t control how dependencies are created or provided and let something external does that for you."

IoC is the broader concept, and DI is one way to achieve it.

- Without IoC → You decide which DB to use and create it manually inside your class.
- With IoC → A framework or container wires everything for you; you only declare what you need.

**Example**

- In frameworks like Spring, NestJS, Angular, you don’t manually create service objects.
- The IoC container handles object creation and dependency resolution, you just ask for them.

### How IoC, DI, and DIP relate (TL;DR)

- DIP (Dependency Inversion Principle) → A design guideline: “Depend on abstractions, not on concrete classes.”
- DI (Dependency Injection) → A technique to implement DIP: inject abstractions instead of instantiating concretes.
- IoC (Inversion of Control) → The broader pattern: external code (a container/framework) manages object creation and wiring.
