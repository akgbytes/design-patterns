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

It helps in

- Reducing the impact of changes: If the email service changes, we only modify `EmailService`, not `UserService`.
- Enhancing testability: We can easily mock `UserRepository` and `EmailService` in unit tests.
- Improving code readability: Each class has a clear purpose, making the codebase easier to understand.
- Clearer fault isolation (if email fails, you don’t dig into DB code).

Things to keep in mind:

- SRP is about reasons to change, not the number of methods. A class can have multiple methods as long as they relate to a single responsibility.
- For example, `UserRepository` is responsible for persistence, but it can have multiple methods like `createUser`, `updateUser`, `deleteUser`.
- Don’t break classes unnecessarily into tiny ones. SRP should reduce coupling and clarify responsibilities, not overcomplicate design.
